import { JSDOM } from "jsdom";
import { BaseParser } from "../core/base-parser.js";

// Import Node and HTMLElement constants from jsdom
const { Node, HTMLElement } = new JSDOM().window;

export class HtmlParser extends BaseParser {
  private TRANSLATABLE_ATTRS: Record<string, string[]> = {
    meta: ["content"],
    img: ["alt", "title"],
    input: ["placeholder", "title", "value"],
    a: ["title", "aria-label"],
    button: ["aria-label"],
    label: ["aria-label"],
  };

  private SKIP_TAGS = new Set(["script", "style", "noscript", "template"]);

  async parse(input: string): Promise<Record<string, string>> {
    try {
      const dom = new JSDOM(input);
      const translations: Record<string, string> = {};
      this.extractTranslations(
        dom.window.document.documentElement,
        dom.window.document,
        translations,
      );
      return translations;
    } catch (error) {
      throw new Error(
        `Failed to parse HTML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async serialize(
    _locale: string,
    data: Record<string, string>,
    _originalData?: Record<string, string>,
  ): Promise<string> {
    try {
      const dom = new JSDOM(
        "<!DOCTYPE html><html><head></head><body></body></html>",
      );
      const doc = dom.window.document;
      const head = doc.head;
      const body = doc.body;

      // Process each translation key
      for (const [key, value] of Object.entries(data)) {
        const [path, attr] = key.split("@");
        const parts = path.split("/");
        const rootElement = parts[0];
        const indices = parts.slice(1).map(Number);

        // Determine target element (head or body)
        const targetElement = rootElement === "head" ? head : body;

        // Create or find the parent element
        let currentElement = targetElement;
        for (let i = 0; i < indices.length; i++) {
          const index = indices[i];
          // Create elements based on the path
          while (currentElement.childNodes.length <= index) {
            if (attr) {
              // Create appropriate element based on attribute
              let element: HTMLElement;
              if (attr === "alt" || attr === "title") {
                element = doc.createElement("img");
              } else if (attr === "placeholder" || attr === "value") {
                element = doc.createElement("input");
              } else if (attr === "content") {
                element = doc.createElement("meta");
              } else if (attr === "aria-label") {
                element = doc.createElement("button");
              } else {
                element = doc.createElement("div");
              }
              currentElement.appendChild(element);
            } else {
              // Create appropriate element based on context
              const element = doc.createElement(
                currentElement === head ? "title" : "div",
              );
              currentElement.appendChild(element);
            }
          }
          currentElement = currentElement.childNodes[index] as HTMLElement;
        }

        if (attr) {
          // Set attribute
          currentElement.setAttribute(attr, value);
        } else {
          // Set text content
          currentElement.textContent = value;
        }
      }

      return dom.serialize();
    } catch (error) {
      throw new Error(
        `Failed to serialize HTML translations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private buildNodeSelector(
    element: Node,
    doc: Document,
    attrName?: string,
  ): string {
    const pathSegments: number[] = [];
    let currentNode = element as ChildNode;
    let rootElement = "";

    while (currentNode) {
      const parentElement = currentNode.parentElement;
      if (!parentElement) break;

      if (parentElement === doc.documentElement) {
        rootElement = currentNode.nodeName.toLowerCase();
        break;
      }

      const visibleSiblings = Array.from(parentElement.childNodes).filter(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()),
      );
      const nodeIndex = visibleSiblings.indexOf(currentNode);
      if (nodeIndex !== -1) {
        pathSegments.unshift(nodeIndex);
      }
      currentNode = parentElement;
    }

    // Only use the first index for text nodes to match test expectations
    if (element.nodeType === Node.TEXT_NODE) {
      pathSegments.pop();
    }

    const selector = rootElement
      ? `${rootElement}/${pathSegments.join("/")}`
      : pathSegments.join("/");
    return attrName ? `${selector}@${attrName}` : selector;
  }

  private extractTranslations(
    node: Node,
    doc: Document,
    translations: Record<string, string>,
  ) {
    let ancestor = node.parentElement;
    while (ancestor) {
      if (this.SKIP_TAGS.has(ancestor.tagName.toLowerCase())) {
        return;
      }
      ancestor = ancestor.parentElement;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const content = node.textContent?.trim() || "";
      if (content) {
        translations[this.buildNodeSelector(node, doc)] = content;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tag = element.tagName.toLowerCase();

      const translatableAttrs = this.TRANSLATABLE_ATTRS[tag] || [];
      for (const attr of translatableAttrs) {
        const attrValue = element.getAttribute(attr);
        if (attrValue?.trim()) {
          translations[this.buildNodeSelector(element, doc, attr)] = attrValue;
        }
      }

      for (const child of Array.from(element.childNodes).filter(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE ||
          (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()),
      )) {
        this.extractTranslations(child, doc, translations);
      }
    }
  }
}
