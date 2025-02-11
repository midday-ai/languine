import json2php from "json2php";
import { Engine } from "php-parser";
import { BaseParser } from "../core/base-parser.js";
import { flatten, unflatten } from "../core/flatten.js";

type PhpAstNode = {
  kind: string;
  value?: string | number;
  items?: PhpArrayItem[];
};

type PhpArrayItem = {
  key?: PhpAstNode;
  value: PhpAstNode;
};

type PhpReturnNode = {
  kind: "return";
  expr: {
    kind: "array";
    items: PhpArrayItem[];
  };
};

export class PhpParser extends BaseParser {
  async parse(input: string) {
    try {
      // Remove PHP opening tag and strict types declaration
      const cleanInput = input
        .replace(/^<\?php\s*/, "")
        .replace(/^declare\(strict_types=1\);/, "");
      const parser = new Engine({
        parser: {
          extractDoc: false,
          php7: true,
        },
        ast: {
          withPositions: false,
        },
      });
      const ast = parser.parseEval(cleanInput);
      if (
        ast.kind !== "program" ||
        !ast.children[0] ||
        ast.children[0].kind !== "return"
      ) {
        throw new Error("Invalid PHP translations file format");
      }

      const returnNode = ast.children[0] as unknown as PhpReturnNode;
      const result = this.astToObject(returnNode.expr);
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error(
          "Invalid PHP translations format: root must be an object",
        );
      }
      return flatten(result);
    } catch (error) {
      throw new Error(
        `Failed to parse PHP translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: string,
  ): Promise<string> {
    const unflattened = unflatten(data);
    // @ts-expect-error json2php root is not correctly typed
    const printer = json2php.make({
      linebreak: "\n",
      indent: "    ",
      shortArraySyntax: true,
    });
    const phpArray = printer(unflattened);
    return `<?php\n\ndeclare(strict_types=1);\n\nreturn ${phpArray};\n`;
  }

  private astToObject(
    node: PhpAstNode,
  ): Record<string, unknown> | string | number | null {
    if (!node) return null;

    switch (node.kind) {
      case "array": {
        const result: Record<string, unknown> = {};
        for (const entry of node.items || []) {
          if (entry.key) {
            const key = this.astToObject(entry.key);
            if (typeof key === "string") {
              result[key] = this.astToObject(entry.value);
            }
          }
        }
        return result;
      }

      case "string":
        return node.value as string;

      case "number":
        return node.value as number;

      default:
        return null;
    }
  }
}
