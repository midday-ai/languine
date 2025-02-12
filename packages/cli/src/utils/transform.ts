import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { client } from "@/utils/api.js";
import type { API, FileInfo, JSCodeshift, Node, Path } from "jscodeshift";

// Load or create translation store
const TRANSLATION_FILE = path.resolve("translations.json");
let translations: Record<string, Record<string, string>> = {};

// Load existing translations if they exist
if (existsSync(TRANSLATION_FILE)) {
  try {
    const existingTranslations = JSON.parse(
      readFileSync(TRANSLATION_FILE, "utf-8"),
    );
    translations = { ...existingTranslations };
  } catch (error) {
    console.warn("Failed to parse existing translations, starting fresh");
  }
}

// Track text occurrences per element type per component
const elementCounts: Record<string, Record<string, number>> = {};

// Attributes that should not be translated
const SKIP_ATTRIBUTES = new Set([
  "href",
  "src",
  "id",
  "className",
  "class",
  "key",
  "name",
  "type",
  "value",
  "for",
  "role",
  "target",
  "rel",
  "aria-labelledby",
  "aria-describedby",
  "data-testid",
  "style",
  "width",
  "height",
  "size",
  "maxLength",
  "min",
  "max",
  "pattern",
  "tabIndex",
]);

// Add proper type definitions for AST nodes
type ASTNode = Node & {
  type: string;
  name?: string;
  value?: string;
  object?: ASTNode;
  property?: ASTNode;
  computed?: boolean;
};

// Get the element type from the JSX path
function getElementType(path: Path): string {
  let current = path;
  while (current) {
    const node = current.node as Node & {
      type?: string;
      openingElement?: {
        name?: { name?: string };
      };
    };

    if (node.type === "JSXElement") {
      const elementName = node.openingElement?.name?.name?.toLowerCase();
      if (elementName) {
        return elementName;
      }
    }
    current = current.parent;
  }
  return "text";
}

// Helper to clean up text for translations
function cleanupText(text: string): string {
  return text
    .replace(/[\n\r\s\t]+/g, " ") // Replace all whitespace (newlines, spaces, tabs) with a single space
    .trim(); // Remove leading/trailing whitespace
}

// Helper to get the current function name from JSX path
function getFunctionName(path: Path): string {
  let current = path;
  while (current) {
    const node = current.node as Node & {
      type?: string;
      id?: { name?: string };
    };

    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression"
    ) {
      if (node.id?.name) {
        return node.id.name;
      }
      // For anonymous functions, try to get the variable name it's assigned to
      const parent = current.parent?.node as Node & {
        type?: string;
        id?: { name?: string };
        key?: { name?: string };
      };
      if (parent?.type === "VariableDeclarator" && parent.id?.name) {
        return parent.id.name;
      }
      if (parent?.type === "Property" && parent.key?.name) {
        return parent.key.name;
      }
    }
    current = current.parent;
  }
  return "unknown";
}

// Get the next key for a component and type
function getNextKey(componentName: string, type: string, path: Path): string {
  const functionName = getFunctionName(path);
  const elementType = getElementType(path);
  const keyBase = `${elementType}`;

  if (!elementCounts[functionName]) {
    elementCounts[functionName] = {};
  }
  elementCounts[functionName][keyBase] =
    (elementCounts[functionName][keyBase] || 0) + 1;

  return `${keyBase}${elementCounts[functionName][keyBase] > 1 ? `_${elementCounts[functionName][keyBase]}` : ""}`;
}

// Helper to create member expression
function createSelectPattern(
  node: Node & {
    expression?: {
      type: string;
      test?: {
        type: string;
        left?: ASTNode;
        operator?: string;
        right?: { value?: string };
      };
      consequent?: { value?: string };
      alternate?: { value?: string };
    };
  },
): { pattern: string | null; variable: string | null } {
  if (
    node.type === "JSXExpressionContainer" &&
    node.expression &&
    node.expression.type === "ConditionalExpression"
  ) {
    const { test, consequent, alternate } = node.expression;

    if (
      test?.type === "BinaryExpression" &&
      test.operator === "===" &&
      test.left &&
      test.right?.value &&
      consequent?.value &&
      alternate?.value
    ) {
      const fullPath = getFullPath(test.left);
      const condition = test.right.value;
      const trueValue = consequent.value;
      const falseValue = alternate.value;
      const simplifiedKey = getSimplifiedKey(fullPath);

      return {
        pattern: `{${simplifiedKey}, select, ${condition} {${trueValue}} other {${falseValue}}}`,
        variable: fullPath,
      };
    }
  }
  return { pattern: null, variable: null };
}

// Helper to get full path from member expression
function getFullPath(node: ASTNode): string {
  const parts: string[] = [];
  let current: ASTNode | undefined = node;

  while (current) {
    if (current.type === "Identifier" && current.name) {
      parts.unshift(current.name);
    } else if (current.type === "MemberExpression") {
      if (
        current.property &&
        current.property.type === "Identifier" &&
        current.property.name
      ) {
        parts.unshift(current.property.name);
      }
      current = current.object;
      continue;
    }
    break;
  }

  return parts.join(".");
}

// Helper to get the simplified key name from a path
function getSimplifiedKey(path: string): string {
  const parts = path.split(".");
  return parts[parts.length - 1];
}

// Helper to create member expression
function createMemberExpression(parts: string[]): ASTNode {
  return parts.reduce(
    (acc: ASTNode, curr: string, idx: number): ASTNode => {
      if (idx === 0) {
        return {
          type: "Identifier",
          name: curr,
        } as ASTNode;
      }
      return {
        type: "MemberExpression",
        object: acc,
        property: {
          type: "Identifier",
          name: curr,
        } as ASTNode,
        computed: false,
      } as ASTNode;
    },
    { type: "Identifier", name: parts[0] } as ASTNode,
  );
}

// Track collected translations before saving
type CollectedTranslation = {
  originalKey: string;
  value: string;
  type: "text" | "attribute" | "link";
  functionName: string;
  elementKey: string;
};

const collectedTranslations: CollectedTranslation[] = [];

// Helper to store translation
function storeTranslation(
  componentName: string,
  key: string,
  value: string,
  path: Path,
): void {
  const functionName = getFunctionName(path);
  const elementType = getElementType(path);

  collectedTranslations.push({
    originalKey: `${functionName}.${key}`,
    value,
    type: elementType === "a" ? "link" : "text",
    functionName,
    elementKey: key,
  });
}

// Helper to get variable name from expression
function getVariableName(node: Node & { expression?: unknown }): string | null {
  if (node.type === "JSXExpressionContainer" && node.expression) {
    const expression = node.expression as {
      type: string;
      object?: {
        type: string;
        object?: { type: string; name?: string };
        property?: { type: string; name?: string };
        name?: string;
      };
      property?: { type: string; name?: string };
    };
    if (expression.type === "MemberExpression") {
      const object = expression.object;
      const property = expression.property;

      // Handle nested properties like user.preferences.language
      if (
        object?.type === "MemberExpression" &&
        property?.type === "Identifier"
      ) {
        const parentObject = object.object;
        const parentProperty = object.property;
        if (
          parentObject?.type === "Identifier" &&
          parentObject.name &&
          parentProperty?.type === "Identifier" &&
          parentProperty.name &&
          property.name
        ) {
          return `${parentObject.name}.${parentProperty.name}.${property.name}`;
        }
      }

      // Handle single level properties like user.notifications
      if (
        object?.type === "Identifier" &&
        object.name &&
        property?.type === "Identifier" &&
        property.name
      ) {
        return `${object.name}.${property.name}`;
      }
    }
  }
  return null;
}

// Check if a node is inside a link
function isInsideLink(path: Path): boolean {
  let current = path;
  while (current) {
    const node = current.node as Node & {
      type?: string;
      openingElement?: {
        name?: { name?: string };
      };
    };

    if (node.type === "JSXElement" && node.openingElement?.name?.name === "a") {
      return true;
    }
    current = current.parent;
  }
  return false;
}

// Helper to create a JSX text node
function createJSXText(j: JSCodeshift, text: string): Node {
  return {
    type: "JSXText",
    value: text,
  };
}

// Identity transformation function - returns the same translations
async function identityTransform(
  translations: Record<string, Record<string, string>>,
): Promise<Array<{ key: string; value: string }>> {
  try {
    // Convert nested translations to array format for API
    const translationsArray = Object.entries(translations).flatMap(
      ([component, strings]) =>
        Object.entries(strings).map(([key, value]) => ({
          key: `${component}.${key}`,
          value,
        })),
    );

    // Send translations to tRPC endpoint and get back transformed translations
    const response = await client.jobs.startTransformJob.mutate({
      projectId: "123",
      translations: translationsArray,
    });

    return response;
  } catch (error) {
    console.error("Failed to transform translations:", error);
    // Return original translations in array format if transformation fails
    return Object.entries(translations).flatMap(([component, strings]) =>
      Object.entries(strings).map(([key, value]) => ({
        key: `${component}.${key}`,
        value,
      })),
    );
  }
}

// Transform and save translations with key override support
async function saveTranslations(
  keyOverrides: Record<string, string> = {},
): Promise<Record<string, Record<string, string>>> {
  // Convert array format to nested format with key overrides
  const transformedTranslations: Record<string, Record<string, string>> = {};

  for (const item of collectedTranslations) {
    const finalKey = keyOverrides[item.originalKey] || item.originalKey;
    const [component, key] = finalKey.split(".");

    if (!transformedTranslations[component]) {
      transformedTranslations[component] = {};
    }
    transformedTranslations[component][key] = item.value;
  }

  // Merge with existing translations if the file exists
  let finalTranslations = { ...transformedTranslations };
  if (existsSync(TRANSLATION_FILE)) {
    try {
      const existingTranslations = JSON.parse(
        readFileSync(TRANSLATION_FILE, "utf-8"),
      );
      finalTranslations = {
        ...existingTranslations,
        ...transformedTranslations,
      };
    } catch (error) {
      console.warn("Failed to merge with existing translations");
    }
  }

  writeFileSync(TRANSLATION_FILE, JSON.stringify(finalTranslations, null, 2));
  return transformedTranslations;
}

// Helper to transform JSX elements
function transformJSXElement(
  j: JSCodeshift,
  path: Path,
  componentName: string,
): void {
  const node = path.node as Node & {
    children?: Array<Node & { type: string; value?: string }>;
  };
  const children = node.children || [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Handle JSX expressions (variables)
    if (child.type === "JSXExpressionContainer") {
      // Check for conditional expressions first
      const selectPattern = createSelectPattern(child);
      if (selectPattern.pattern && selectPattern.variable) {
        const key = getNextKey(componentName, "text", path);
        storeTranslation(componentName, key, selectPattern.pattern, path);

        const functionName = getFunctionName(path);
        const replacement = j.jsxExpressionContainer(
          j.callExpression(j.identifier("t"), [
            j.literal(`${functionName}.${key}`),
            {
              type: "ObjectExpression",
              properties: [
                {
                  type: "ObjectProperty",
                  key: {
                    type: "Identifier",
                    name: getSimplifiedKey(selectPattern.variable),
                  } as unknown as Node,
                  value: createMemberExpression(
                    selectPattern.variable.split("."),
                  ) as unknown as Node,
                  shorthand: false,
                  computed: false,
                } as unknown as Node,
              ],
            } as unknown as Node,
          ]),
        );

        children[i] = replacement;
        continue;
      }

      const varName = getVariableName(child);
      if (varName) {
        // Check for text after the variable
        const nextChild = children[i + 1];
        const textAfter =
          nextChild?.type === "JSXText" ? nextChild.value || "" : "";

        if (textAfter) {
          // Handle variable + text case (like "{theme} mode")
          const key = getNextKey(componentName, "text", path);
          const simplifiedKey = getSimplifiedKey(varName);
          const template = `{${simplifiedKey}}${textAfter}`;

          storeTranslation(componentName, key, template, path);
          const functionName = getFunctionName(path);

          const replacement = j.jsxExpressionContainer(
            j.callExpression(j.identifier("t"), [
              j.literal(`${functionName}.${key}`),
              {
                type: "ObjectExpression",
                properties: [
                  {
                    type: "ObjectProperty",
                    key: {
                      type: "Identifier",
                      name: simplifiedKey,
                    } as unknown as Node,
                    value: createMemberExpression(
                      varName.split("."),
                    ) as unknown as Node,
                    shorthand: false,
                    computed: false,
                  } as unknown as Node,
                ],
              } as unknown as Node,
            ]),
          );

          // Replace both the variable and the text after it
          children.splice(i, 2, replacement);
          continue;
        }
      }
    }

    // Handle other cases...
    if (child.type === "JSXText") {
      const text = child.value || "";
      if (!text.trim()) continue;

      // Check if next nodes are expressions
      const variables: Array<{
        name: string;
        node: Node;
        pluralCondition?: Node;
      }> = [];
      let nextIndex = i + 1;
      let hasVariables = false;

      while (nextIndex < children.length) {
        const nextChild = children[nextIndex];
        if (nextChild.type === "JSXExpressionContainer") {
          const varName = getVariableName(nextChild);
          if (varName) {
            variables.push({
              name: varName,
              node: nextChild,
            });
            hasVariables = true;
            nextIndex++;

            // Look for text after the variable
            if (nextIndex < children.length) {
              const afterNode = children[nextIndex];
              if (afterNode.type === "JSXText" && afterNode.value) {
                nextIndex++;
              }
            }
            continue;
          }
        }
        break;
      }

      if (hasVariables) {
        // Create combined text with variables and preserve spaces
        const parts = children.slice(i, nextIndex).map((node) => {
          if (node.type === "JSXText") {
            // Clean up whitespace in text parts while preserving single spaces between words
            return cleanupText(node.value || "");
          }
          const varName = getVariableName(node);
          if (!varName) return "";
          const simplifiedKey = getSimplifiedKey(varName);
          return `{${simplifiedKey}}`;
        });

        const combinedText = parts.join("").trim();

        if (combinedText) {
          const key = getNextKey(componentName, "text", path);
          storeTranslation(componentName, key, combinedText, path);
          const functionName = getFunctionName(path);

          const variablesObj = {
            type: "ObjectExpression",
            properties: variables.map(({ name }) => ({
              type: "ObjectProperty",
              key: { type: "Identifier", name: getSimplifiedKey(name) },
              value: createMemberExpression(name.split(".")),
              shorthand: false,
              computed: false,
            })),
          } as unknown as Node;

          const replacement = j.jsxExpressionContainer(
            j.callExpression(j.identifier("t"), [
              j.literal(`${functionName}.${key}`),
              variablesObj,
            ]),
          );

          children.splice(i, nextIndex - i, replacement);
        }
      } else {
        // Handle regular text
        const cleanText = cleanupText(text);
        if (cleanText.length >= 2 && /[a-zA-Z]/.test(cleanText)) {
          const isLink = isInsideLink(path);
          const key = getNextKey(componentName, isLink ? "link" : "text", path);
          storeTranslation(componentName, key, cleanText, path);
          const functionName = getFunctionName(path);

          const replacement = j.jsxExpressionContainer(
            j.callExpression(j.identifier("t"), [
              j.literal(`${functionName}.${key}`),
            ]),
          );

          // Handle whitespace
          const leadingSpace = text.match(/^\s*\n\s*/)?.[0] || "";
          const trailingSpace = text.match(/\s*\n\s*$/)?.[0] || "";

          if (leadingSpace || trailingSpace) {
            const nodes: Node[] = [];
            if (leadingSpace) nodes.push(createJSXText(j, leadingSpace));
            nodes.push(replacement);
            if (trailingSpace) nodes.push(createJSXText(j, trailingSpace));
            children.splice(i, 1, ...nodes);
          } else {
            children[i] = replacement;
          }
        }
      }
    }
  }
}

export default async function transform(
  file: FileInfo,
  api: API,
  options?: {
    keyOverrides?: Record<string, string>;
  },
): Promise<string> {
  const j = api.jscodeshift;

  // First clean up the source by removing extra parentheses
  const source = file.source.replace(
    /return\s*\(\s*(<[\s\S]*?>)\s*\)\s*;/g,
    "return $1;",
  );
  const root = j(source);

  // Get the component name from the file path
  const componentName = path.basename(file.path).replace(/\.[jt]sx?$/, "");

  // Clear collected translations for this run
  collectedTranslations.length = 0;

  // Replace JSX text content
  const elements = root.find("JSXElement");
  for (const parentPath of elements.paths()) {
    transformJSXElement(j, parentPath, componentName);
  }

  // Replace string literals in JSX attributes
  for (const path of root.find(j.StringLiteral).paths()) {
    const parent = path.parent.node as Node & {
      type?: string;
      name?: { name?: string };
    };

    if (parent.type !== "JSXAttribute") continue;

    const text = path.node.value;
    if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
      continue; // Skip empty, short, or non-text content
    }

    const cleanText = cleanupText(text);
    const attrName = parent.name?.name;
    // Skip non-translatable attributes
    if (attrName && SKIP_ATTRIBUTES.has(attrName)) {
      continue;
    }

    const key = getNextKey(componentName, "attribute", path);
    if (!key) continue;

    storeTranslation(componentName, key, cleanText, path);

    // Create t() call with proper key
    const functionName = getFunctionName(path);
    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [
        j.literal(`${functionName}.${key}`),
      ]),
    );

    root
      .find(j.StringLiteral)
      .filter((p) => p.node.value === text)
      .replaceWith(replacement);
  }

  try {
    // Apply key overrides and save translations
    const keyOverrides = options?.keyOverrides || {};
    const savedTranslations = await saveTranslations(keyOverrides);
    console.log("Saved translations:", savedTranslations);

    // Update all t() calls in the source to use overridden keys
    const calls = root.find("CallExpression");

    for (const path of calls.paths()) {
      const node = path.value as {
        type: string;
        callee?: { type: string; name: string };
        arguments?: Array<{ type: string; value: string }>;
      };

      if (
        node.callee?.type === "Identifier" &&
        node.callee.name === "t" &&
        node.arguments?.[0]?.type === "StringLiteral"
      ) {
        const originalKey = node.arguments[0].value;
        // Look up if there's an override for this key
        const finalKey = keyOverrides[originalKey] || originalKey;

        // Update with the final key
        const callNode = path.node as Node & { arguments: Array<Node> };
        callNode.arguments[0] = j.literal(finalKey);
      }
    }
  } catch (error) {
    console.error("Error saving translations:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  }

  // Return the transformed source with proper formatting
  return root.toSource({
    quote: "double",
  });
}
