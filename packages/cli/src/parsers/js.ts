import * as babelParser from "@babel/parser";
import type { Node, ObjectExpression, Parser, StringLiteral } from "./types.js";

class FunctionCallParser implements Parser {
  constructor(private functions: string[]) {}

  parse(node: Node, keys: string[]): void {
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "Identifier" &&
      this.functions.includes(node.callee.name || "")
    ) {
      const firstArg = node.arguments?.[0] as StringLiteral | undefined;
      if (firstArg?.type === "StringLiteral") {
        keys.push(firstArg.value);
      }
    }
  }
}

class IntlFormatParser implements Parser {
  parse(node: Node, keys: string[]): void {
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.name === "intl" &&
      node.callee.property?.name === "formatMessage"
    ) {
      const firstArg = node.arguments?.[0] as ObjectExpression | undefined;
      if (firstArg?.type === "ObjectExpression") {
        const idProperty = firstArg.properties?.find(
          (prop) => prop.key?.name === "id",
        );
        if (idProperty?.value?.type === "StringLiteral") {
          keys.push(idProperty.value.value);
        }
      }
    }
  }
}

class I18nParser implements Parser {
  parse(node: Node, keys: string[]): void {
    if (
      node.type === "CallExpression" &&
      node.callee?.type === "MemberExpression" &&
      node.callee.object?.name === "i18n" &&
      node.callee.property?.name === "t"
    ) {
      const firstArg = node.arguments?.[0] as StringLiteral | undefined;
      if (firstArg?.type === "StringLiteral") {
        keys.push(firstArg.value);
      }
    }
  }
}

class JSXComponentParser implements Parser {
  constructor(private components: string[]) {}

  parse(node: Node, keys: string[]): void {
    if (
      node.type === "JSXOpeningElement" &&
      this.components.includes(node.name?.name || "")
    ) {
      const idAttr = node.attributes?.find((attr) => attr.name?.name === "id");
      if (idAttr?.value?.type === "StringLiteral") {
        keys.push(idAttr.value.value);
      }
    }
  }
}

export const parseJS = (
  code: string,
  functions: string[] = ["t"],
  components: string[] = ["FormattedMessage", "Trans"],
): string[] => {
  const ast = babelParser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const keys: string[] = [];
  const parsers: Parser[] = [
    new FunctionCallParser(functions),
    new IntlFormatParser(),
    new I18nParser(),
    new JSXComponentParser(components),
  ];
  const traverseNode = (node: Node) => {
    if (!node) return;

    // Apply all parsers
    for (const parser of parsers) {
      parser.parse(node, keys);
    }

    // Recursively traverse child nodes
    for (const key in node) {
      const value = node[key as keyof Node];
      if (Array.isArray(value)) {
        for (const child of value) {
          traverseNode(child as Node);
        }
      } else if (typeof value === "object" && value !== null) {
        traverseNode(value as Node);
      }
    }
  };

  traverseNode(ast as Node);

  return keys;
};
