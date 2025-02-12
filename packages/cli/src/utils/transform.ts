import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  API,
  Collection,
  FileInfo,
  JSCodeshift,
  Node,
  Path,
} from "jscodeshift";

// Load or create translation store
const TRANSLATION_FILE = path.resolve("translations.json");
const translations = existsSync(TRANSLATION_FILE)
  ? JSON.parse(readFileSync(TRANSLATION_FILE, "utf-8"))
  : {};

// Track text occurrences per type
const textOccurrences: Record<string, number> = {};

// Generate a key using a simple counter approach
function generateKey(text: string, type: string): string {
  const key = `${type}:${text.toLowerCase()}`;
  if (!textOccurrences[key]) {
    textOccurrences[key] = 1;
    return "";
  }
  textOccurrences[key]++;
  return `_${textOccurrences[key]}`;
}

// Create a translation key based on the component name and type
function getTranslationKey(
  componentName: string,
  type: string,
  text: string,
): string | undefined {
  const suffix = generateKey(text, type);
  const key = `${componentName}.${type}${suffix}`;
  if (!translations[key]) {
    translations[key] = text;
  }
  return key;
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

// Check if a node is inside a link with a local path
function isInsideLocalLink(path: Path): boolean {
  let current = path;
  while (current) {
    const node = current.node as Node & {
      type?: string;
      openingElement?: {
        name?: { name?: string };
        attributes?: Array<{
          name?: { name?: string };
          value?: { type?: string; value?: string };
        }>;
      };
    };

    if (node.type === "JSXElement" && node.openingElement?.name?.name === "a") {
      const hrefAttr = node.openingElement.attributes?.find(
        (attr) =>
          attr.name?.name === "href" && attr.value?.type === "StringLiteral",
      );
      if (hrefAttr?.value?.value?.startsWith("/")) {
        return true;
      }
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

    // Skip text inside local links
    if (isInsideLocalLink(path)) {
      continue;
    }

    const key = getTranslationKey(componentName, "text", text);
    if (!key) continue;

    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(key)]),
    );

    // Preserve whitespace
    const leadingSpace = value.match(/^\s*\n\s*/)?.[0] || "";
    const trailingSpace = value.match(/\s*\n\s*$/)?.[0] || "";

    if (leadingSpace || trailingSpace) {
      const span = {
        type: "JSXElement",
        openingElement: {
          type: "JSXOpeningElement",
          name: { type: "JSXIdentifier", name: "span" },
          attributes: [],
          selfClosing: false,
        },
        closingElement: {
          type: "JSXClosingElement",
          name: { type: "JSXIdentifier", name: "span" },
        },
        children: [
          ...(leadingSpace ? [createJSXText(j, leadingSpace)] : []),
          replacement,
          ...(trailingSpace ? [createJSXText(j, trailingSpace)] : []),
        ],
      };

      root
        .find(j.JSXText)
        .filter((p) => p.node.value === value)
        .replaceWith(span);
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

    // Skip href attributes that are local paths
    if (parent.name?.name === "href" && text.startsWith("/")) {
      continue;
    }

    const key = getTranslationKey(componentName, "attribute", text);
    if (!key) continue;

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
