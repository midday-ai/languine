import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { API, FileInfo, JSCodeshift, Node, Path } from "jscodeshift";

// Load or create translation store
const TRANSLATION_FILE = path.resolve("translations.json");
const translations = existsSync(TRANSLATION_FILE)
  ? JSON.parse(readFileSync(TRANSLATION_FILE, "utf-8"))
  : {};

// Track text occurrences per element type
const elementCounts: Record<string, number> = {};

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

// Create a translation key based on the component name and element type
function getTranslationKey(
  componentName: string,
  type: string,
  text: string,
  path: Path,
): string {
  if (type === "attribute") {
    const parent = path.parent.node as Node & {
      type?: string;
      name?: { name?: string };
    };
    const attrName = parent.name?.name;

    if (attrName === "type") {
      const elementType = getElementType(path);
      elementCounts[elementType] = (elementCounts[elementType] || 0) + 1;
      return `${componentName}.type_${elementCounts[elementType]}`;
    }
    return `${componentName}.${attrName}`;
  }

  // For text content, use the element type
  const elementType = getElementType(path);
  elementCounts[elementType] = (elementCounts[elementType] || 0) + 1;
  return elementType === "text"
    ? `${componentName}.text_${elementCounts[elementType]}`
    : `${componentName}.${elementType}${elementCounts[elementType] > 1 ? `_${elementCounts[elementType]}` : ""}`;
}

// Save translations to file
function saveTranslations(): void {
  writeFileSync(TRANSLATION_FILE, JSON.stringify(translations, null, 2));
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

  // Replace JSX text content
  for (const path of root.find(j.JSXText).paths()) {
    const value = path.node.value || "";
    const text = value.trim();
    if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
      continue; // Skip empty, short, or non-text content
    }

    // Get text inside links
    const isLink = isInsideLink(path);
    const key = getTranslationKey(
      componentName,
      isLink ? "link" : "text",
      text,
      path,
    );
    if (!key) continue;

    if (!translations[key]) {
      translations[key] = text;
    }

    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(key)]),
    );

    // Handle whitespace by creating separate text nodes
    const leadingSpace = value.match(/^\s*\n\s*/)?.[0] || "";
    const trailingSpace = value.match(/\s*\n\s*$/)?.[0] || "";

    if (leadingSpace || trailingSpace) {
      const nodes: Node[] = [];
      if (leadingSpace) nodes.push(createJSXText(j, leadingSpace));
      nodes.push(replacement);
      if (trailingSpace) nodes.push(createJSXText(j, trailingSpace));

      const paths = root
        .find(j.JSXText)
        .filter((p) => p.node.value === value)
        .paths();

      for (const path of paths) {
        const parent = path.parent.node as Node & {
          children?: Node[];
        };
        if (parent.children) {
          const index = parent.children.indexOf(path.node);
          if (index !== -1) {
            parent.children.splice(index, 1, ...nodes);
          }
        }
      }
    } else {
      root
        .find(j.JSXText)
        .filter((p) => p.node.value === value)
        .replaceWith(replacement);
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

    const attrName = parent.name?.name;
    // Skip non-translatable attributes
    if (attrName && SKIP_ATTRIBUTES.has(attrName)) {
      continue;
    }

    const key = getTranslationKey(componentName, "attribute", text, path);
    if (!key) continue;

    if (!translations[key]) {
      translations[key] = text;
    }

    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(key)]),
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
