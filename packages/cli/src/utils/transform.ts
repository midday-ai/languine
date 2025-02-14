import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { API, FileInfo, JSCodeshift, Node, Path } from "jscodeshift";

// Core types for the transformer
type ASTNode = Node & {
  type: string;
  name?: string;
  value?: string;
  object?: ASTNode;
  property?: ASTNode;
  computed?: boolean;
};

type CollectedTranslation = {
  originalKey: string;
  value: string;
  type: "text" | "attribute" | "link";
  functionName: string;
  elementKey: string;
};

/**
 * Service for transforming JSX/TSX files to use translations.
 * Handles extraction of text content, attributes, and dynamic content.
 */
export class TransformService {
  // State management
  private translations: Record<string, Record<string, string>> = {};
  private elementCounts: Record<string, number> = {};
  private collectedTranslations: CollectedTranslation[] = [];
  private keyMap: Record<string, string> = {};

  // Constants
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

  /**
   * Main transformation method that processes a file
   */
  public async transform(file: FileInfo, api: API): Promise<string> {
    const j = api.jscodeshift;
    const source = this.cleanSource(file.source);
    const root = j(source);
    const componentName = this.getComponentName(file.path);

    this.collectedTranslations.length = 0;
    this.keyMap = {}; // Reset key map for each file

    // First pass: collect all translations without modifying the AST
    // This will also generate keys via storeTranslation
    await this.collectTranslations(j, root, componentName);

    // Build the transformed translations to save to file
    const transformedTranslations = this.buildTransformedTranslations();

    // Second pass: transform the AST with the generated keys
    await this.transformWithGeneratedKeys(j, root, componentName);

    // Save the translations
    await this.saveTranslations();

    return root.toSource({ quote: "double" });
  }

  /**
   * Generate keys for all collected translations
   * This is where you would integrate with your key generation API
   */
  private async generateKeys(): Promise<void> {
    try {
      // First, build the translations to generate unique keys
      this.buildTransformedTranslations();

      // Ensure all translations have a key mapping
      for (const translation of this.collectedTranslations) {
        if (!this.keyMap[translation.originalKey]) {
          this.keyMap[translation.originalKey] = this.generateKeyFromValue(
            translation.value,
            translation.type,
          );
        }
      }
    } catch (error) {
      console.error("Failed to generate keys:", error);
      // Fallback: use original keys if generation fails
      for (const translation of this.collectedTranslations) {
        if (!this.keyMap[translation.originalKey]) {
          this.keyMap[translation.originalKey] = this.generateKeyFromValue(
            translation.value,
            translation.type,
          );
        }
      }
    }
  }

  /**
   * Mock API call for key generation
   * Replace this with your actual API integration
   */
  private async generateKeysFromAPI(
    translations: Array<{
      originalKey: string;
      value: string;
      type: string;
      functionName: string;
    }>,
  ): Promise<Record<string, string>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const keyMap: Record<string, string> = {};
    const seenValues = new Map<string, string>();

    for (const translation of translations) {
      // Check if we've already generated a key for this value
      let generatedKey = seenValues.get(translation.value);
      if (!generatedKey) {
        generatedKey = this.generateKeyFromValue(
          translation.value,
          translation.type,
        );
        seenValues.set(translation.value, generatedKey);
      }

      keyMap[translation.originalKey] = generatedKey;
    }

    return keyMap;
  }

  private buildTransformedTranslations(): Record<
    string,
    Record<string, string>
  > {
    const transformedTranslations: Record<string, Record<string, string>> = {};
    const seenValues = new Map<string, string>();

    for (const item of this.collectedTranslations) {
      const generatedKey = this.keyMap[item.originalKey];

      // Ensure we have a key
      if (!generatedKey) {
        console.warn(`No key found for translation: ${item.originalKey}`);
        continue;
      }

      // Extract component name from the generated key
      const [component] = generatedKey.split(".");

      // Initialize component section if needed
      if (!transformedTranslations[component]) {
        transformedTranslations[component] = {};
      }

      // Store using the generated key
      if (!seenValues.has(item.value)) {
        transformedTranslations[component][generatedKey] = item.value;
        seenValues.set(item.value, generatedKey);
      }
    }

    return transformedTranslations;
  }

  private generateKeyFromValue(value: string, type: string): string {
    const normalizedValue = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    return `${type}_${normalizedValue}`.substring(0, 50);
  }

  private storeTranslation(
    componentName: string,
    key: string,
    value: string,
    path: Path,
  ): void {
    const functionName = this.getFunctionName(path);
    const originalKey = `${functionName}.${key}`;
    const type = this.getElementType(path) === "a" ? "link" : "text";

    // Check if we've already seen this value
    const existingTranslation = this.collectedTranslations.find(
      (t) => t.value === value,
    );

    if (existingTranslation) {
      // Reuse the existing key for this value
      this.keyMap[originalKey] = this.keyMap[existingTranslation.originalKey];
    } else {
      // Generate a new key for this value
      const generatedKey = `${functionName}.${this.generateKeyFromValue(value, type)}`;
      this.keyMap[originalKey] = generatedKey;

      this.collectedTranslations.push({
        originalKey,
        value,
        type,
        functionName,
        elementKey: key,
      });
    }
  }

  // File Processing Methods
  private cleanSource(source: string): string {
    return source.replace(/return\s*\(\s*(<[\s\S]*?>)\s*\)\s*;/g, "return $1;");
  }

  private getComponentName(filePath: string): string {
    return path.basename(filePath).replace(/\.[jt]sx?$/, "");
  }

  // Translation File Management
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

  private async saveTranslations(): Promise<
    Record<string, Record<string, string>>
  > {
    const transformedTranslations = this.buildTransformedTranslations();
    const finalTranslations = await this.mergePreviousTranslations(
      transformedTranslations,
    );

    writeFileSync(
      this.translationFile,
      JSON.stringify(finalTranslations, null, 2),
    );
    return transformedTranslations;
  }

  private async mergePreviousTranslations(
    newTranslations: Record<string, Record<string, string>>,
  ): Promise<Record<string, Record<string, string>>> {
    if (!existsSync(this.translationFile)) {
      return newTranslations;
    }

    try {
      const existingTranslations = JSON.parse(
        readFileSync(this.translationFile, "utf-8"),
      );
      return {
        ...existingTranslations,
        ...newTranslations,
      };
    } catch (error) {
      console.warn("Failed to merge with existing translations");
      return newTranslations;
    }
  }

  // AST Transformation Methods
  private async collectTranslations(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    // Find all text content and store translations
    const elements = root.find("JSXElement");
    for (const path of elements.paths()) {
      this.collectFromJSXElement(path, componentName);
    }

    // Find all string literals and store translations
    for (const path of root.find(j.StringLiteral).paths()) {
      this.collectFromStringLiteral(path, componentName);
    }
  }

  private async transformWithGeneratedKeys(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    try {
      // Transform JSX elements with the generated keys
      const elements = root.find("JSXElement");
      for (const path of elements.paths()) {
        this.transformJSXElement(j, path, componentName);
      }

      // Transform string literals with the generated keys
      for (const path of root.find(j.StringLiteral).paths()) {
        this.handleStringLiteral(j, root, path, componentName);
      }

      const savedTranslations = await this.saveTranslations();
      console.log("Saved translations:", savedTranslations);
    } catch (error) {
      console.error("Error transforming with generated keys:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
    }
  }

  private collectFromJSXElement(path: Path, componentName: string): void {
    const node = path.node as Node & {
      children?: Array<Node & { type: string; value?: string }>;
    };
    const children = node.children || [];

    for (const child of children) {
      if (child.type === "JSXText") {
        const text = child.value || "";
        if (text.trim()) {
          const cleanText = this.cleanupText(text);
          if (cleanText.length >= 2 && /[a-zA-Z]/.test(cleanText)) {
            const isLink = this.isInsideLink(path);
            const key = this.getNextKey(
              componentName,
              isLink ? "link" : "text",
              path,
            );
            this.storeTranslation(componentName, key, cleanText, path);
          }
        }
      }
    }
  }

  private collectFromStringLiteral(path: Path, componentName: string): void {
    const parent = path.parent.node as Node & {
      type?: string;
      name?: { name?: string };
    };

    if (parent.type !== "JSXAttribute") return;

    const text = path.node.value;
    if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
      return;
    }

    const cleanText = this.cleanupText(text);
    const attrName = parent.name?.name;
    if (attrName && this.SKIP_ATTRIBUTES.has(attrName)) {
      return;
    }

    const key = this.getNextKey(componentName, "attribute", path);
    if (!key) return;

    this.storeTranslation(componentName, key, cleanText, path);
  }

  // JSX Processing Methods
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
        i = this.handleJSXExpression(j, children, i, path, componentName);
      } else if (child.type === "JSXText") {
        i = this.handleJSXText(j, children, i, path, componentName);
      }
    }
  }

  private handleJSXExpression(
    j: JSCodeshift,
    children: Array<Node & { type: string; value?: string }>,
    index: number,
    path: Path,
    componentName: string,
  ): number {
    const child = children[index];
    const selectPattern = this.createSelectPattern(child);

    if (selectPattern.pattern && selectPattern.variable) {
      children[index] = this.createSelectTranslation(
        j,
        selectPattern as { pattern: string; variable: string },
        path,
        componentName,
      );
      return index;
    }

    const varName = this.getVariableName(child);
    if (varName) {
      const nextChild = children[index + 1];
      const textAfter =
        nextChild?.type === "JSXText" ? nextChild.value || "" : "";

      if (textAfter) {
        children[index] = this.createVariableWithTextTranslation(
          j,
          varName,
          textAfter,
          path,
          componentName,
        );
        return index + 1;
      }
    }

    return index;
  }

  private handleJSXText(
    j: JSCodeshift,
    children: Array<Node & { type: string; value?: string }>,
    index: number,
    path: Path,
    componentName: string,
  ): number {
    const child = children[index];
    const text = child.value || "";
    if (!text.trim()) return index;

    const { hasVariables, nextIndex, variables } = this.collectVariables(
      children,
      index,
    );

    if (hasVariables) {
      return this.handleTextWithVariables(
        j,
        children,
        index,
        nextIndex,
        variables,
        path,
        componentName,
      );
    }

    return this.handleSimpleText(j, children, index, text, path, componentName);
  }

  // Utility Methods
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

    const key = `${elementType}`;
    if (!this.elementCounts[key]) {
      this.elementCounts[key] = 0;
    }
    this.elementCounts[key]++;

    const count = this.elementCounts[key];
    const suffix = count > 1 ? `_${count}` : "";
    return `${key}${suffix}`;
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

  private handleStringLiteral(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    path: Path,
    componentName: string,
  ): void {
    const parent = path.parent.node as Node & {
      type?: string;
      name?: { name?: string };
    };

    if (parent.type !== "JSXAttribute") return;

    const text = path.node.value;
    if (!text || text.length < 2 || !/[a-zA-Z]/.test(text)) {
      return;
    }

    const cleanText = this.cleanupText(text);
    const attrName = parent.name?.name;
    if (attrName && this.SKIP_ATTRIBUTES.has(attrName)) {
      return;
    }

    const key = this.getNextKey(componentName, "attribute", path);
    if (!key) return;

    const functionName = this.getFunctionName(path);
    const originalKey = `${functionName}.${key}`;

    this.storeTranslation(componentName, key, cleanText, path);

    // Use the mapped key if available, otherwise use the original key
    const mappedKey = this.keyMap[originalKey] || originalKey;

    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(mappedKey)]),
    );

    root
      .find(j.StringLiteral)
      .filter((p: Path) => p.node.value === text)
      .replaceWith(replacement);
  }

  private createSelectTranslation(
    j: JSCodeshift,
    selectPattern: { pattern: string; variable: string },
    path: Path,
    componentName: string,
  ): Node {
    const key = this.getNextKey(componentName, "text", path);
    const functionName = this.getFunctionName(path);
    const originalKey = `${functionName}.${key}`;

    this.storeTranslation(componentName, key, selectPattern.pattern, path);

    // Use the mapped key if available, otherwise use the original key
    const mappedKey = this.keyMap[originalKey] || originalKey;

    return j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [
        j.literal(mappedKey),
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
  }

  private createVariableWithTextTranslation(
    j: JSCodeshift,
    varName: string,
    textAfter: string,
    path: Path,
    componentName: string,
  ): Node {
    const key = this.getNextKey(componentName, "text", path);
    const simplifiedKey = this.getSimplifiedKey(varName);
    const template = `{${simplifiedKey}}${textAfter}`;
    const functionName = this.getFunctionName(path);
    const originalKey = `${functionName}.${key}`;

    this.storeTranslation(componentName, key, template, path);

    // Use the mapped key if available, otherwise use the original key
    const mappedKey = this.keyMap[originalKey] || originalKey;

    return j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [
        j.literal(mappedKey),
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
  }

  private handleSimpleText(
    j: JSCodeshift,
    children: Array<Node & { type: string; value?: string }>,
    index: number,
    text: string,
    path: Path,
    componentName: string,
  ): number {
    const cleanText = this.cleanupText(text);
    if (cleanText.length >= 2 && /[a-zA-Z]/.test(cleanText)) {
      const isLink = this.isInsideLink(path);
      const key = this.getNextKey(
        componentName,
        isLink ? "link" : "text",
        path,
      );
      const functionName = this.getFunctionName(path);
      const originalKey = `${functionName}.${key}`;

      this.storeTranslation(componentName, key, cleanText, path);

      // Use the mapped key if available, otherwise use the original key
      const mappedKey = this.keyMap[originalKey] || originalKey;

      const replacement = j.jsxExpressionContainer(
        j.callExpression(j.identifier("t"), [j.literal(mappedKey)]),
      );

      const leadingSpace = text.match(/^\s*\n\s*/)?.[0] || "";
      const trailingSpace = text.match(/\s*\n\s*$/)?.[0] || "";

      if (leadingSpace || trailingSpace) {
        const nodes: Node[] = [];
        if (leadingSpace) nodes.push(this.createJSXText(j, leadingSpace));
        nodes.push(replacement);
        if (trailingSpace) nodes.push(this.createJSXText(j, trailingSpace));
        children.splice(index, 1, ...nodes);
      } else {
        children[index] = replacement;
      }
    }

    return index;
  }

  private collectVariables(
    children: Array<Node & { type: string; value?: string }>,
    startIndex: number,
  ): {
    hasVariables: boolean;
    nextIndex: number;
    variables: Array<{ name: string; node: Node; pluralCondition?: Node }>;
  } {
    const variables: Array<{
      name: string;
      node: Node;
      pluralCondition?: Node;
    }> = [];
    let nextIndex = startIndex + 1;
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

    return { hasVariables, nextIndex, variables };
  }

  private handleTextWithVariables(
    j: JSCodeshift,
    children: Array<Node & { type: string; value?: string }>,
    startIndex: number,
    endIndex: number,
    variables: Array<{ name: string; node: Node; pluralCondition?: Node }>,
    path: Path,
    componentName: string,
  ): number {
    const parts = children.slice(startIndex, endIndex).map((node) => {
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
      const functionName = this.getFunctionName(path);
      const originalKey = `${functionName}.${key}`;

      this.storeTranslation(componentName, key, combinedText, path);

      // Use the mapped key if available, otherwise use the original key
      const mappedKey = this.keyMap[originalKey] || originalKey;

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
          j.literal(mappedKey),
          variablesObj,
        ]),
      );

      children.splice(startIndex, endIndex - startIndex, replacement);
    }

    return endIndex - 1;
  }
}

export default async function transform(
  file: FileInfo,
  api: API,
): Promise<string> {
  const transformer = new TransformService();
  return transformer.transform(file, api);
}
