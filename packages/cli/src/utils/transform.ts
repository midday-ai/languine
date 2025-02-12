import crypto from "node:crypto";
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

// Generate a short hash for unique keys
function generateKey(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex").slice(0, 6);
}

// Create a translation key based on the component name and type
function getTranslationKey(
  componentName: string,
  type: string,
  text: string,
): string {
  const key = `${componentName}.${type}_${generateKey(text)}`;
  if (!translations[key]) {
    translations[key] = text; // Store original text
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

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Get the component name from the file path
  const componentName = path.basename(file.path).replace(/\.[jt]sx?$/, "");

  // Replace JSX text content
  for (const path of root.find(j.JSXText).paths()) {
    const value = path.node.value || "";
    const text = value.trim();
    if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
      continue; // Skip empty, short, or non-text content
    }

    const key = getTranslationKey(componentName, "text", text);
    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(key)]),
    );

    // Preserve whitespace
    const leadingSpace = value.match(/^\s*\n\s*/)?.[0] || "";
    const trailingSpace = value.match(/\s*\n\s*$/)?.[0] || "";

    if (leadingSpace || trailingSpace) {
      // Create a span element to hold multiple nodes
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
    if (path.parent.node.type !== "JSXAttribute") continue;

    const text = path.node.value;
    if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
      continue; // Skip empty, short, or non-text content
    }

    const key = getTranslationKey(componentName, "attribute", text);
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

  // Return the transformed source
  return root.toSource({
    quote: "double",
  });
}
