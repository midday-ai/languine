import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { API, FileInfo, JSCodeshift, Node, Path } from "jscodeshift";
import { client } from "./api.ts";

// Core types and interfaces
interface ASTNode extends Node {
  type: string;
  name?: string;
  value?: string;
  object?: ASTNode;
  property?: ASTNode;
  computed?: boolean;
}

interface CollectedTranslation {
  originalKey: string;
  value: string;
  type: "text" | "attribute" | "link";
  functionName: string;
  elementKey: string;
}

interface TransformState {
  translations: Record<string, Record<string, string>>;
  elementCounts: Record<string, number>;
  collectedTranslations: CollectedTranslation[];
  keyMap: Record<string, string>;
  apiKeys: Record<string, string>;
}

interface SelectPattern {
  pattern: string;
  variable: string;
}

interface Variable {
  name: string;
  node: Node;
  pluralCondition?: Node;
}

/**
 * Service for transforming JSX/TSX files to use translations.
 * Handles extraction of text content, attributes, and dynamic content.
 */
export class TransformService {
  // State management
  private state: TransformState = {
    translations: {},
    elementCounts: {},
    collectedTranslations: [],
    keyMap: {},
    apiKeys: {},
  };

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

  // Public API
  public async transform(file: FileInfo, api: API): Promise<string> {
    const j = api.jscodeshift;
    const source = this.cleanSource(file.source);
    const root = j(source);
    const componentName = this.getComponentName(file.path);

    this.resetState();
    await this.processTranslations(j, root, componentName);
    await this.saveTranslations();

    return root.toSource({ quote: "double" });
  }

  // Main Processing Methods
  private async processTranslations(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    await this.collectTranslations(j, root, componentName);

    // Generate API keys for all collected translations
    const apiKeys = await this.generateAPIKeys(
      this.state.collectedTranslations,
    );
    this.state.apiKeys = apiKeys;

    // Update keyMap with API keys where available
    for (const translation of this.state.collectedTranslations) {
      const apiKey = apiKeys[translation.originalKey];
      if (apiKey) {
        this.state.keyMap[translation.originalKey] = apiKey;
      }
    }

    await this.transformWithGeneratedKeys(j, root, componentName);
  }

  private async collectTranslations(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    const elements = root.find("JSXElement");
    for (const path of elements.paths()) {
      this.collectFromJSXElement(path, componentName);
    }

    for (const path of root.find(j.StringLiteral).paths()) {
      this.collectFromStringLiteral(path, componentName);
    }
  }

  // Translation Management Methods
  private loadTranslations(): void {
    if (existsSync(this.translationFile)) {
      try {
        const existingTranslations = JSON.parse(
          readFileSync(this.translationFile, "utf-8"),
        );
        this.state.translations = { ...existingTranslations };
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
      const content = readFileSync(this.translationFile, "utf-8");
      // Handle empty file case
      if (!content.trim()) {
        return newTranslations;
      }

      const existingTranslations = JSON.parse(content);
      // Ensure existingTranslations is an object
      if (
        typeof existingTranslations !== "object" ||
        existingTranslations === null
      ) {
        console.warn("Invalid translations file format, starting fresh");
        return newTranslations;
      }

      // Merge translations by component
      const mergedTranslations: Record<string, Record<string, string>> = {
        ...existingTranslations,
      };

      // Merge new translations into existing ones
      for (const [component, translations] of Object.entries(newTranslations)) {
        if (!mergedTranslations[component]) {
          mergedTranslations[component] = {};
        }
        mergedTranslations[component] = {
          ...mergedTranslations[component],
          ...translations,
        };
      }

      return mergedTranslations;
    } catch (error) {
      console.warn("Failed to merge with existing translations:", error);
      return newTranslations;
    }
  }

  // State Management Methods
  private resetState(): void {
    this.state.collectedTranslations.length = 0;
    this.state.keyMap = {};
    this.state.apiKeys = {};
  }

  private buildTransformedTranslations(): Record<
    string,
    Record<string, string>
  > {
    const transformedTranslations: Record<string, Record<string, string>> = {};
    const seenValues = new Map<string, string>();

    for (const item of this.state.collectedTranslations) {
      // Prefer API-generated key if available, fall back to local key
      const generatedKey =
        this.state.apiKeys[item.originalKey] ||
        this.state.keyMap[item.originalKey];
      if (!generatedKey) {
        console.warn(`No key found for translation: ${item.originalKey}`);
        continue;
      }

      // Extract just the numeric key part for the JSON
      const keyParts = generatedKey.split(".");
      const simpleKey = keyParts[keyParts.length - 1];
      const [component] = item.functionName.split(".");

      if (!transformedTranslations[component]) {
        transformedTranslations[component] = {};
      }

      if (!seenValues.has(item.value)) {
        transformedTranslations[component][simpleKey] = item.value;
        seenValues.set(item.value, simpleKey);
      }
    }

    return transformedTranslations;
  }

  // File Processing Methods
  private cleanSource(source: string): string {
    return source.replace(/return\s*\(\s*(<[\s\S]*?>)\s*\)\s*;/g, "return $1;");
  }

  private getComponentName(filePath: string): string {
    return path.basename(filePath).replace(/\.[jt]sx?$/, "");
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

  private storeTranslation(
    componentName: string,
    key: string,
    value: string,
    path: Path,
  ): void {
    const functionName = this.getFunctionName(path);
    const originalKey = `${functionName}.${key}`;

    // Check if we've already seen this value
    const existingTranslation = this.state.collectedTranslations.find(
      (t) => t.value === value,
    );

    if (existingTranslation) {
      // Reuse the existing key for this value
      this.state.keyMap[originalKey] =
        this.state.keyMap[existingTranslation.originalKey];
    } else {
      this.state.collectedTranslations.push({
        originalKey,
        value,
        type: this.getElementType(path) === "a" ? "link" : "text",
        functionName,
        elementKey: key,
      });
      // Store the full key with functionName prefix
      this.state.keyMap[originalKey] = originalKey;
    }
  }

  // AST Transformation Methods
  private async transformWithGeneratedKeys(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    try {
      await this.transformJSXElements(j, root, componentName);
      await this.transformStringLiterals(j, root, componentName);

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

  private async transformJSXElements(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    const elements = root.find("JSXElement");
    for (const path of elements.paths()) {
      this.transformJSXElement(j, path, componentName);
    }
  }

  private async transformStringLiterals(
    j: JSCodeshift,
    root: ReturnType<JSCodeshift>,
    componentName: string,
  ): Promise<void> {
    for (const path of root.find(j.StringLiteral).paths()) {
      this.handleStringLiteral(j, root, path, componentName);
    }
  }

  // JSX Element Processing Methods
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
      i = this.processJSXChild(j, children, i, path, componentName);
    }
  }

  private processJSXChild(
    j: JSCodeshift,
    children: Array<Node & { type: string; value?: string }>,
    index: number,
    path: Path,
    componentName: string,
  ): number {
    const child = children[index];

    if (child.type === "JSXExpressionContainer") {
      return this.handleJSXExpression(j, children, index, path, componentName);
    }

    if (child.type === "JSXText") {
      return this.handleJSXText(j, children, index, path, componentName);
    }

    return index;
  }

  // Translation Creation Methods
  private createSelectTranslation(
    j: JSCodeshift,
    selectPattern: SelectPattern,
    path: Path,
    componentName: string,
  ): Node {
    const key = this.getNextKey(componentName, "text", path);
    const functionName = this.getFunctionName(path);
    const originalKey = `${functionName}.${key}`;

    this.storeTranslation(componentName, key, selectPattern.pattern, path);

    // Use the API-generated key if available, otherwise use the original key
    const mappedKey =
      this.state.apiKeys[originalKey] ||
      this.state.keyMap[originalKey] ||
      originalKey;

    return this.createTranslationNode(j, mappedKey, {
      [this.getSimplifiedKey(selectPattern.variable)]:
        this.createMemberExpression(selectPattern.variable.split(".")),
    });
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

    // Use the API-generated key if available, otherwise use the original key
    const mappedKey =
      this.state.apiKeys[originalKey] ||
      this.state.keyMap[originalKey] ||
      originalKey;

    return this.createTranslationNode(j, mappedKey, {
      [simplifiedKey]: this.createMemberExpression(varName.split(".")),
    });
  }

  private createTranslationNode(
    j: JSCodeshift,
    key: string,
    variables: Record<string, Node>,
  ): Node {
    return j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [
        j.literal(key),
        {
          type: "ObjectExpression",
          properties: Object.entries(variables).map(([name, value]) => ({
            type: "ObjectProperty",
            key: { type: "Identifier", name } as unknown as Node,
            value: value as unknown as Node,
            shorthand: false,
            computed: false,
          })),
        } as unknown as Node,
      ]),
    );
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
    const elementName = this.getElementName(path);

    // Get or initialize counter for this element name
    if (!this.state.elementCounts[elementName]) {
      this.state.elementCounts[elementName] = 0;
    }
    this.state.elementCounts[elementName]++;

    // If this is the first occurrence, just return the element name
    if (this.state.elementCounts[elementName] === 1) {
      return elementName;
    }

    // For subsequent occurrences, add _N suffix where N starts from 1
    return `${elementName}_${this.state.elementCounts[elementName] - 1}`;
  }

  private getElementName(path: Path): string {
    const node = path.node as Node & {
      type?: string;
      openingElement?: { name?: { name?: string } };
      name?: { name?: string };
    };

    // For JSXElements, get the element name (e.g., 'div', 'span', etc.)
    if (node.type === "JSXElement" && node.openingElement?.name?.name) {
      return node.openingElement.name.name.toLowerCase();
    }

    // For attributes, get the attribute name
    if (path.parent?.node?.type === "JSXAttribute") {
      const attrNode = path.parent.node as Node & { name?: { name?: string } };
      return attrNode.name?.name || "attr";
    }

    // For text nodes, use 'text'
    if (node.type === "JSXText") {
      return "text";
    }

    // For string literals not in attributes, use 'string'
    if (node.type === "StringLiteral") {
      return "string";
    }

    return "unknown";
  }

  private createSelectPattern(
    node: Node & {
      expression?: {
        type: string;
        test?: {
          type: string;
          left?: { type: string; value?: string };
          operator?: string;
          right?: { type: string; value?: string };
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
    const mappedKey = this.state.keyMap[originalKey] || originalKey;

    const replacement = j.jsxExpressionContainer(
      j.callExpression(j.identifier("t"), [j.literal(mappedKey)]),
    );

    root
      .find(j.StringLiteral)
      .filter((p: Path) => p.node.value === text)
      .replaceWith(replacement);
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
    const parts = children.slice(startIndex, endIndex).map((node, index) => {
      if (node.type === "JSXText") {
        const text = this.cleanupText(node.value || "");
        // If next node is a variable and current text doesn't end with a space
        // and the text is not empty, add a space
        const nextNode = children[startIndex + index + 1];
        if (
          nextNode?.type === "JSXExpressionContainer" &&
          text &&
          !text.endsWith(" ")
        ) {
          return `${text} `;
        }
        return text;
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

      // Use API key if available, otherwise use keyMap or original key
      const mappedKey =
        this.state.apiKeys[originalKey] ||
        this.state.keyMap[originalKey] ||
        originalKey;

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

      // Use API key if available, otherwise use keyMap or original key
      const mappedKey =
        this.state.apiKeys[originalKey] ||
        this.state.keyMap[originalKey] ||
        originalKey;

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

  private async generateAPIKeys(
    translations: CollectedTranslation[],
  ): Promise<Record<string, string>> {
    const result = await client.jobs.startTransformJob.mutate({
      projectId: "prj_xpuq472jzv5zv9uey0s5h6eu",
      translations: translations.map((t) => ({
        key: `${t.functionName}.${t.originalKey}`,
        value: t.value,
      })),
    });

    const keys: Record<string, string> = {};
    for (const translation of result) {
      keys[translation.key] = translation.value;
    }

    console.log("keys", keys);

    return keys;
  }
}

export default async function transform(
  file: FileInfo,
  api: API,
): Promise<string> {
  const transformer = new TransformService();
  return transformer.transform(file, api);
}
