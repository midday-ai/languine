import fs from "node:fs";
import path from "node:path";
import * as babel from "@babel/parser";
import _traverse, { type NodePath } from "@babel/traverse";
import type {
  ArrowFunctionExpression,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXOpeningElement,
  JSXText,
  Node,
  StringLiteral,
  VariableDeclarator,
} from "@babel/types";
import glob from "fast-glob";

// @ts-ignore - traverse has incorrect types
const traverse = _traverse.default || _traverse;

export interface ExtractedText {
  text: string;
  filepath: string;
  location: {
    start: number;
    end: number;
  };
}

export interface ExtractedStrings {
  [component: string]: {
    [key: string]: ExtractedText;
  };
}

interface ElementCounts {
  [key: string]: {
    [elementName: string]: number;
  };
}

// List of attributes that contain translatable text
const TRANSLATABLE_ATTRIBUTES = ["alt", "title", "placeholder", "aria-label"];

export function extractStringsFromJSX(filePath: string): ExtractedStrings {
  const code = fs.readFileSync(filePath, "utf8");

  const ast = babel.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const extracted: ExtractedStrings = {};
  const fileName = path
    .basename(filePath, path.extname(filePath))
    .toLowerCase();

  let currentFunction: string | null = null;
  const elementCounts: ElementCounts = {};

  function addExtractedText(
    parentKey: string,
    elementName: string,
    text: string,
    location: { start: number; end: number },
    attributeName?: string,
  ) {
    if (!text.trim()) return; // Skip empty strings

    if (!elementCounts[parentKey]) {
      elementCounts[parentKey] = {};
    }
    if (!elementCounts[parentKey][elementName]) {
      elementCounts[parentKey][elementName] = 0;
    }

    elementCounts[parentKey][elementName]++;

    if (!extracted[parentKey]) {
      extracted[parentKey] = {};
    }

    const count = elementCounts[parentKey][elementName];
    let childKey = count > 1 ? `${elementName}_${count - 1}` : elementName;

    // If this is an attribute, append it to the key
    if (attributeName) {
      childKey = `${childKey}_${attributeName.replace(/-/g, "_")}`;
    }

    extracted[parentKey][childKey] = {
      text,
      filepath: filePath,
      location,
    };
  }

  traverse(ast, {
    FunctionDeclaration(path: NodePath<FunctionDeclaration>) {
      const id = path.node.id as Identifier;
      currentFunction = id?.name?.toLowerCase() || null;
      if (currentFunction) {
        elementCounts[currentFunction] = {};
      }
    },
    FunctionExpression(path: NodePath<FunctionExpression>) {
      const parent = path.parent as VariableDeclarator;
      const id = parent.id as Identifier;
      currentFunction = id?.name?.toLowerCase() || null;
      if (currentFunction) {
        elementCounts[currentFunction] = {};
      }
    },
    ArrowFunctionExpression(path: NodePath<ArrowFunctionExpression>) {
      if (path.parent.type === "VariableDeclarator") {
        const parent = path.parent as VariableDeclarator;
        const id = parent.id as Identifier;
        currentFunction = id?.name?.toLowerCase() || null;
        if (currentFunction) {
          elementCounts[currentFunction] = {};
        }
      }
    },
    JSXText(path: NodePath<JSXText>) {
      const trimmedText = path.node.value.trim();
      if (trimmedText) {
        const parentKey = currentFunction || fileName;

        let currentPath: NodePath | null = path.parentPath;
        let elementName = "text";

        while (currentPath) {
          const node = currentPath.node;
          if (node.type === "JSXElement") {
            const element = (node as JSXElement).openingElement;
            if (element.name.type === "JSXIdentifier") {
              elementName = element.name.name.toLowerCase();
              break;
            }
          }
          currentPath = currentPath.parentPath;
        }

        addExtractedText(parentKey, elementName, trimmedText, {
          start: path.node.start!,
          end: path.node.end!,
        });
      }
    },
    JSXAttribute(path: NodePath<JSXAttribute>) {
      const attrName = (path.node.name as JSXIdentifier).name;
      const attrValue = path.node.value as StringLiteral;

      if (
        TRANSLATABLE_ATTRIBUTES.includes(attrName) &&
        attrValue?.type === "StringLiteral" &&
        attrValue.value.trim()
      ) {
        const parentKey = currentFunction || fileName;
        let elementName = "unknown";

        let currentPath: NodePath | null = path.parentPath;
        while (currentPath) {
          const node = currentPath.node;
          if (node.type === "JSXOpeningElement") {
            const element = node as JSXOpeningElement;
            if (element.name.type === "JSXIdentifier") {
              elementName = element.name.name.toLowerCase();
              break;
            }
          }
          currentPath = currentPath.parentPath;
        }

        addExtractedText(
          parentKey,
          elementName,
          attrValue.value,
          {
            start: attrValue.start!,
            end: attrValue.end!,
          },
          attrName,
        );
      }
    },
  });
  return extracted;
}

export async function processDirectory(folderPath: string) {
  const files = await glob([`${folderPath}/**/*.{tsx,jsx}`], {
    absolute: true,
  });
  const allResults: ExtractedStrings = {};

  for (const file of files) {
    try {
      const result = extractStringsFromJSX(file);
      Object.assign(allResults, result);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  return allResults;
}

export async function applyTranslations(extractedStrings: ExtractedStrings) {
  const fileCache: { [filepath: string]: string } = {};
  const replacements: Array<{
    filepath: string;
    start: number;
    end: number;
    replacement: string;
  }> = [];

  for (const [componentName, componentStrings] of Object.entries(
    extractedStrings,
  )) {
    for (const [stringKey, stringData] of Object.entries(componentStrings)) {
      const { filepath, location, text } = stringData;
      const translationKey = `${componentName}.${stringKey}`;

      replacements.push({
        filepath,
        start: location.start,
        end: location.end,
        replacement: `{t('${translationKey}')}`,
      });
    }
  }

  replacements.sort((a, b) => {
    if (a.filepath !== b.filepath) {
      return a.filepath.localeCompare(b.filepath);
    }
    return b.start - a.start;
  });

  for (const { filepath, start, end, replacement } of replacements) {
    if (!fileCache[filepath]) {
      fileCache[filepath] = fs.readFileSync(filepath, "utf8");
    }

    const content = fileCache[filepath];
    fileCache[filepath] =
      content.slice(0, start) + replacement + content.slice(end);
  }

  for (const [filepath, content] of Object.entries(fileCache)) {
    try {
      fs.writeFileSync(filepath, content, "utf8");
      console.log(`Updated translations in: ${filepath}`);
    } catch (error) {
      console.error(`Error writing to ${filepath}:`, error);
    }
  }
}
