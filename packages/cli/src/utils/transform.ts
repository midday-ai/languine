import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
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

// Create a translation key based on the component name and element type
function getTranslationKey(
  componentName: string,
  type: string,
  text: string,
  path: Path,
): string {
  // Initialize component counts if not exists
  if (!elementCounts[componentName]) {
    elementCounts[componentName] = {};
  }

  if (type === "attribute") {
    const parent = path.parent.node as Node & {
      type?: string;
      name?: { name?: string };
    };
    const attrName = parent.name?.name;

    if (attrName === "type") {
      const elementType = getElementType(path);
      elementCounts[componentName][elementType] =
        (elementCounts[componentName][elementType] || 0) + 1;
      return `type_${elementCounts[componentName][elementType]}`;
    }
    return attrName || "";
  }

  // For text content, use the element type
  const elementType = getElementType(path);
  elementCounts[componentName][elementType] =
    (elementCounts[componentName][elementType] || 0) + 1;
  return elementType === "text"
    ? `text_${elementCounts[componentName][elementType]}`
    : `${elementType}${elementCounts[componentName][elementType] > 1 ? `_${elementCounts[componentName][elementType]}` : ""}`;
}

// Helper to store translation
function storeTranslation(
  componentName: string,
  key: string,
  value: string,
): void {
  if (!translations[componentName]) {
    translations[componentName] = {};
  }
  translations[componentName][key] = value;
}

// Save translations to file with component nesting
function saveTranslations(): void {
  // Merge with existing translations if the file exists
  let finalTranslations = { ...translations };
  if (existsSync(TRANSLATION_FILE)) {
    try {
      const existingTranslations = JSON.parse(
        readFileSync(TRANSLATION_FILE, "utf-8"),
      );
      finalTranslations = { ...existingTranslations, ...translations };
    } catch (error) {
      console.warn("Failed to merge with existing translations");
    }
  }

  writeFileSync(TRANSLATION_FILE, JSON.stringify(finalTranslations, null, 2));
}

// Helper to create a JSX text node
function createJSXText(j: JSCodeshift, text: string): Node {
  return {
    type: "JSXText",
    value: text,
  };
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

// Helper to check if a node is a JSX expression
function isJSXExpression(node: Node): boolean {
  return node.type === "JSXExpressionContainer";
}

// Helper to get variable name from expression
function getVariableName(node: Node & { expression?: unknown }): string | null {
  if (node.type === "JSXExpressionContainer" && node.expression) {
    const expression = node.expression as {
      type: string;
      object?: { type: string };
      property?: { type: string; name?: string };
    };
    if (expression.type === "MemberExpression") {
      const object = expression.object;
      const property = expression.property;
      if (
        object &&
        property &&
        property.type === "Identifier" &&
        property.name
      ) {
        return property.name;
      }
    }
  }
  return null;
}

// Helper to detect and create pluralization pattern
function createPluralPattern(
  text: string,
  varName: string,
  pluralCondition: Node & {
    type: string;
    expression?: {
      type: string;
      test?: {
        type: string;
        operator?: string;
        right?: {
          type: string;
          value?: number;
        };
      };
    };
  },
): string | null {
  // Check if it's a conditional expression for pluralization
  if (
    pluralCondition.type === "JSXExpressionContainer" &&
    pluralCondition.expression
  ) {
    const expr = pluralCondition.expression;
    if (expr.type === "ConditionalExpression" && expr.test) {
      const test = expr.test;
      if (
        test.type === "BinaryExpression" &&
        test.operator === "!==" &&
        test.right?.type === "NumericLiteral" &&
        test.right.value === 1
      ) {
        // This is a pluralization pattern like: {count !== 1 ? 's' : ''}
        return `{${varName}, plural, =1 {${text}} other {${text}s}}`;
      }
    }
  }
  return null;
}

// Helper to create a translation with variables and pluralization
function createTranslationWithVars(
  j: JSCodeshift,
  key: string,
  text: string,
  variables: Array<{ name: string; node: Node; pluralCondition?: Node }>,
): Node {
  // Create the variables object for t() call
  const properties = variables.map(({ name }) => ({
    type: "ObjectProperty",
    key: { type: "Identifier", name },
    value: { type: "Identifier", name },
  }));

  const variablesObj = {
    type: "ObjectExpression",
    properties,
  };

  // Store the template in translations
  let template = cleanupText(text);

  // Check for pluralization patterns
  for (const variable of variables) {
    if (variable.pluralCondition) {
      const pluralPattern = createPluralPattern(
        template,
        variable.name,
        variable.pluralCondition,
      );
      if (pluralPattern) {
        template = pluralPattern;
        break; // Only handle one pluralization per string for now
      }
    }
  }

  // Store final template
  template = template.replace(/\{([^}]+)\}/g, (_, name) => {
    // Skip if it's already a plural pattern
    if (name.includes("plural")) return `{${name}}`;
    return `{${name}}`;
  });

  const [comp, ...rest] = key.split(".");
  if (comp) {
    if (!translations[comp]) translations[comp] = {};
    translations[comp][rest.join(".")] = template;
  }

  // Create t() call with variables
  return j.jsxExpressionContainer(
    j.callExpression(j.identifier("t"), [j.literal(key), variablesObj]),
  );
}

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;

  // First clean up the source by removing extra parentheses
  const source = file.source.replace(
    /return\s*\(\s*(<[\s\S]*?>)\s*\)\s*;/g,
    "return $1;",
  );
  const root = j(source);

  // Get the component name from the file path
  const componentName = path.basename(file.path).replace(/\.[jt]sx?$/, "");

  // Initialize component in translations if not exists
  if (!translations[componentName]) {
    translations[componentName] = {};
  }

  // Replace JSX text content
  const elements = root.find("JSXElement");
  for (const parentPath of elements.paths()) {
    const parentNode = parentPath.node as Node & {
      children?: Array<Node & { type: string; value?: string }>;
    };
    const children = parentNode.children || [];

    // Look for text + expression patterns
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === "JSXText") {
        const text = (child.value || "").trim();
        if (!text) continue;

        // Check if next nodes are expressions
        const variables: Array<{
          name: string;
          node: Node;
          pluralCondition?: Node & {
            type: string;
            expression?: {
              type: string;
              test?: {
                type: string;
                operator?: string;
                right?: {
                  type: string;
                  value?: number;
                };
              };
            };
          };
        }> = [];
        let nextIndex = i + 1;
        let hasVariables = false;

        while (nextIndex < children.length) {
          const nextChild = children[nextIndex];
          if (isJSXExpression(nextChild)) {
            const varName = getVariableName(nextChild);
            if (varName) {
              // Look ahead for potential pluralization condition
              const pluralCondition =
                nextIndex + 1 < children.length
                  ? (children[nextIndex + 1] as Node & {
                      type: string;
                      expression?: {
                        type: string;
                        test?: {
                          type: string;
                          operator?: string;
                          right?: {
                            type: string;
                            value?: number;
                          };
                        };
                      };
                    })
                  : undefined;

              variables.push({
                name: varName,
                node: nextChild,
                pluralCondition,
              });
              hasVariables = true;
              nextIndex++;

              // Skip the pluralization condition if found
              if (pluralCondition && isJSXExpression(pluralCondition)) {
                nextIndex++;
              }

              // Check for following text
              if (
                nextIndex < children.length &&
                children[nextIndex].type === "JSXText"
              ) {
                nextIndex++;
              }
              continue;
            }
          }
          break;
        }

        if (hasVariables) {
          // Create combined text with variables
          const combinedText = cleanupText(
            children
              .slice(i, nextIndex)
              .map((node) => {
                if (node.type === "JSXText") return node.value || "";
                const varName = getVariableName(node);
                return varName ? `{${varName}}` : "";
              })
              .join(""),
          );

          if (combinedText) {
            const key = getTranslationKey(
              componentName,
              "text",
              combinedText,
              parentPath,
            );
            storeTranslation(componentName, key, combinedText);

            const replacement = createTranslationWithVars(
              j,
              `${componentName}.${key}`,
              combinedText,
              variables,
            );

            // Replace all nodes with the new translation
            children.splice(i, nextIndex - i, replacement);
          }
        } else {
          // Handle regular text as before
          const cleanText = cleanupText(text);
          if (cleanText.length >= 2 && /[a-zA-Z]/.test(cleanText)) {
            const isLink = isInsideLink(parentPath);
            const key = getTranslationKey(
              componentName,
              isLink ? "link" : "text",
              cleanText,
              parentPath,
            );
            storeTranslation(componentName, key, cleanText);

            const replacement = j.jsxExpressionContainer(
              j.callExpression(j.identifier("t"), [
                j.literal(`${componentName}.${key}`),
              ]),
            );

            // Handle whitespace
            const leadingSpace = child.value?.match(/^\s*\n\s*/)?.[0] || "";
            const trailingSpace = child.value?.match(/\s*\n\s*$/)?.[0] || "";

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

    const key = getTranslationKey(componentName, "attribute", cleanText, path);
    if (!key) continue;

    storeTranslation(componentName, key, cleanText);

    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [
        j.literal(`${componentName}.${key}`),
      ]),
    );

    root
      .find(j.StringLiteral)
      .filter((p) => p.node.value === text)
      .replaceWith(replacement);
  }

  // Save the translations
  saveTranslations();

  // Return the transformed source with proper formatting
  return root.toSource({
    quote: "double",
  });
}
