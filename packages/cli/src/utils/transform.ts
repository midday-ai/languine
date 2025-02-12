import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { client } from "@/utils/api.js";
import type { API, FileInfo, JSCodeshift, Node, Path } from "jscodeshift";

type ASTNode = Node & {
  type: string;
  name?: string;
  value?: string;
  object?: ASTNode;
  property?: ASTNode;
  computed?: boolean;
};

export class TransformService {
  private translations: Record<string, Record<string, string>> = {};
  private elementCounts: Record<string, Record<string, number>> = {};
  private collectedTranslations: Array<{
    originalKey: string;
    value: string;
    type: "text" | "attribute" | "link";
    functionName: string;
    elementKey: string;
  }> = [];

  private readonly SKIP_ATTRIBUTES = new Set([
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

  constructor(
    private translationFile: string = path.resolve("translations.json"),
  ) {
    this.loadTranslations();
  }

  private loadTranslations(): void {
    if (existsSync(this.translationFile)) {
      try {
        const existingTranslations = JSON.parse(
          readFileSync(this.translationFile, "utf-8"),
        );
        this.translations = { ...existingTranslations };
      } catch (error) {
        console.warn("Failed to parse existing translations, starting fresh");
      }
    }
  }

  private getElementType(path: Path): string {
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

  private cleanupText(text: string): string {
    return text.replace(/[\n\r\s\t]+/g, " ").trim();
  }

  private getFunctionName(path: Path): string {
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

  private getNextKey(componentName: string, type: string, path: Path): string {
    const functionName = this.getFunctionName(path);
    const elementType = this.getElementType(path);
    const keyBase = `${elementType}`;

    if (!this.elementCounts[functionName]) {
      this.elementCounts[functionName] = {};
    }
    this.elementCounts[functionName][keyBase] =
      (this.elementCounts[functionName][keyBase] || 0) + 1;

    return `${keyBase}${this.elementCounts[functionName][keyBase] > 1 ? `_${this.elementCounts[functionName][keyBase]}` : ""}`;
  }

  private createSelectPattern(
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
        const fullPath = this.getFullPath(test.left);
        const condition = test.right.value;
        const trueValue = consequent.value;
        const falseValue = alternate.value;
        const simplifiedKey = this.getSimplifiedKey(fullPath);

        return {
          pattern: `{${simplifiedKey}, select, ${condition} {${trueValue}} other {${falseValue}}}`,
          variable: fullPath,
        };
      }
    }
    return { pattern: null, variable: null };
  }

  private getFullPath(node: ASTNode): string {
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

  private getSimplifiedKey(path: string): string {
    const parts = path.split(".");
    return parts[parts.length - 1];
  }

  private createMemberExpression(parts: string[]): ASTNode {
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

  private storeTranslation(
    componentName: string,
    key: string,
    value: string,
    path: Path,
  ): void {
    const functionName = this.getFunctionName(path);
    const elementType = this.getElementType(path);

    this.collectedTranslations.push({
      originalKey: `${functionName}.${key}`,
      value,
      type: elementType === "a" ? "link" : "text",
      functionName,
      elementKey: key,
    });
  }

  private getVariableName(
    node: Node & { expression?: unknown },
  ): string | null {
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

  private isInsideLink(path: Path): boolean {
    let current = path;
    while (current) {
      const node = current.node as Node & {
        type?: string;
        openingElement?: {
          name?: { name?: string };
        };
      };

      if (
        node.type === "JSXElement" &&
        node.openingElement?.name?.name === "a"
      ) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }

  private createJSXText(j: JSCodeshift, text: string): Node {
    return {
      type: "JSXText",
      value: text,
    };
  }

  private async identityTransform(
    translations: Record<string, Record<string, string>>,
  ): Promise<Array<{ key: string; value: string }>> {
    try {
      const translationsArray = Object.entries(translations).flatMap(
        ([component, strings]) =>
          Object.entries(strings).map(([key, value]) => ({
            key: `${component}.${key}`,
            value,
          })),
      );

      const response = await client.jobs.startTransformJob.mutate({
        projectId: "123",
        translations: translationsArray,
      });

      return response;
    } catch (error) {
      console.error("Failed to transform translations:", error);
      return Object.entries(translations).flatMap(([component, strings]) =>
        Object.entries(strings).map(([key, value]) => ({
          key: `${component}.${key}`,
          value,
        })),
      );
    }
  }

  private async saveTranslations(
    keyOverrides: Record<string, string> = {},
  ): Promise<Record<string, Record<string, string>>> {
    const transformedTranslations: Record<string, Record<string, string>> = {};

    for (const item of this.collectedTranslations) {
      const finalKey = keyOverrides[item.originalKey] || item.originalKey;
      const [component, key] = finalKey.split(".");

      if (!transformedTranslations[component]) {
        transformedTranslations[component] = {};
      }
      transformedTranslations[component][key] = item.value;
    }

    let finalTranslations = { ...transformedTranslations };
    if (existsSync(this.translationFile)) {
      try {
        const existingTranslations = JSON.parse(
          readFileSync(this.translationFile, "utf-8"),
        );
        finalTranslations = {
          ...existingTranslations,
          ...transformedTranslations,
        };
      } catch (error) {
        console.warn("Failed to merge with existing translations");
      }
    }

    writeFileSync(
      this.translationFile,
      JSON.stringify(finalTranslations, null, 2),
    );
    return transformedTranslations;
  }

  private transformJSXElement(
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

      if (child.type === "JSXExpressionContainer") {
        const selectPattern = this.createSelectPattern(child);
        if (selectPattern.pattern && selectPattern.variable) {
          const key = this.getNextKey(componentName, "text", path);
          this.storeTranslation(
            componentName,
            key,
            selectPattern.pattern,
            path,
          );

          const functionName = this.getFunctionName(path);
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
                      name: this.getSimplifiedKey(selectPattern.variable),
                    } as unknown as Node,
                    value: this.createMemberExpression(
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

        const varName = this.getVariableName(child);
        if (varName) {
          const nextChild = children[i + 1];
          const textAfter =
            nextChild?.type === "JSXText" ? nextChild.value || "" : "";

          if (textAfter) {
            const key = this.getNextKey(componentName, "text", path);
            const simplifiedKey = this.getSimplifiedKey(varName);
            const template = `{${simplifiedKey}}${textAfter}`;

            this.storeTranslation(componentName, key, template, path);
            const functionName = this.getFunctionName(path);

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
                      value: this.createMemberExpression(
                        varName.split("."),
                      ) as unknown as Node,
                      shorthand: false,
                      computed: false,
                    } as unknown as Node,
                  ],
                } as unknown as Node,
              ]),
            );

            children.splice(i, 2, replacement);
            continue;
          }
        }
      }

      if (child.type === "JSXText") {
        const text = child.value || "";
        if (!text.trim()) continue;

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
            const varName = this.getVariableName(nextChild);
            if (varName) {
              variables.push({
                name: varName,
                node: nextChild,
              });
              hasVariables = true;
              nextIndex++;

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
          const parts = children.slice(i, nextIndex).map((node) => {
            if (node.type === "JSXText") {
              return this.cleanupText(node.value || "");
            }
            const varName = this.getVariableName(node);
            if (!varName) return "";
            const simplifiedKey = this.getSimplifiedKey(varName);
            return `{${simplifiedKey}}`;
          });

          const combinedText = parts.join("").trim();

          if (combinedText) {
            const key = this.getNextKey(componentName, "text", path);
            this.storeTranslation(componentName, key, combinedText, path);
            const functionName = this.getFunctionName(path);

            const variablesObj = {
              type: "ObjectExpression",
              properties: variables.map(({ name }) => ({
                type: "ObjectProperty",
                key: { type: "Identifier", name: this.getSimplifiedKey(name) },
                value: this.createMemberExpression(name.split(".")),
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
          const cleanText = this.cleanupText(text);
          if (cleanText.length >= 2 && /[a-zA-Z]/.test(cleanText)) {
            const isLink = this.isInsideLink(path);
            const key = this.getNextKey(
              componentName,
              isLink ? "link" : "text",
              path,
            );
            this.storeTranslation(componentName, key, cleanText, path);
            const functionName = this.getFunctionName(path);

            const replacement = j.jsxExpressionContainer(
              j.callExpression(j.identifier("t"), [
                j.literal(`${functionName}.${key}`),
              ]),
            );

            const leadingSpace = text.match(/^\s*\n\s*/)?.[0] || "";
            const trailingSpace = text.match(/\s*\n\s*$/)?.[0] || "";

            if (leadingSpace || trailingSpace) {
              const nodes: Node[] = [];
              if (leadingSpace) nodes.push(this.createJSXText(j, leadingSpace));
              nodes.push(replacement);
              if (trailingSpace)
                nodes.push(this.createJSXText(j, trailingSpace));
              children.splice(i, 1, ...nodes);
            } else {
              children[i] = replacement;
            }
          }
        }
      }
    }
  }

  public async transform(
    file: FileInfo,
    api: API,
    options?: {
      keyOverrides?: Record<string, string>;
    },
  ): Promise<string> {
    const j = api.jscodeshift;

    const source = file.source.replace(
      /return\s*\(\s*(<[\s\S]*?>)\s*\)\s*;/g,
      "return $1;",
    );
    const root = j(source);

    const componentName = path.basename(file.path).replace(/\.[jt]sx?$/, "");

    this.collectedTranslations.length = 0;

    const elements = root.find("JSXElement");
    for (const parentPath of elements.paths()) {
      this.transformJSXElement(j, parentPath, componentName);
    }

    for (const path of root.find(j.StringLiteral).paths()) {
      const parent = path.parent.node as Node & {
        type?: string;
        name?: { name?: string };
      };

      if (parent.type !== "JSXAttribute") continue;

      const text = path.node.value;
      if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
        continue;
      }

      const cleanText = this.cleanupText(text);
      const attrName = parent.name?.name;
      if (attrName && this.SKIP_ATTRIBUTES.has(attrName)) {
        continue;
      }

      const key = this.getNextKey(componentName, "attribute", path);
      if (!key) continue;

      this.storeTranslation(componentName, key, cleanText, path);

      const functionName = this.getFunctionName(path);
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
      const keyOverrides = options?.keyOverrides || {};
      const savedTranslations = await this.saveTranslations(keyOverrides);
      console.log("Saved translations:", savedTranslations);

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
          const finalKey = keyOverrides[originalKey] || originalKey;

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

    return root.toSource({
      quote: "double",
    });
  }
}

export default async function transform(
  file: FileInfo,
  api: API,
  options?: {
    keyOverrides?: Record<string, string>;
  },
): Promise<string> {
  const transformer = new TransformService();
  return transformer.transform(file, api, options);
}
