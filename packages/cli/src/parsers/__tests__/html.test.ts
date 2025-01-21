import { describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("HTML Parser", () => {
  const parser = createParser({ type: "html" });

  describe("parse", () => {
    test("extracts text content", async () => {
      const input = `
        <html>
          <body>
            <div>Hello</div>
            <p>World</p>
          </body>
        </html>
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "body/0": "Hello",
        "body/1": "World",
      });
    });

    test("extracts translatable attributes", async () => {
      const input = `
        <html>
          <body>
            <img alt="Image description" title="Image title">
            <input placeholder="Enter text" value="Default value">
            <a title="Link title">Link</a>
            <button aria-label="Click me">Button</button>
          </body>
        </html>
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "body/0@alt": "Image description",
        "body/0@title": "Image title",
        "body/1@placeholder": "Enter text",
        "body/1@value": "Default value",
        "body/2@title": "Link title",
        "body/2": "Link",
        "body/3@aria-label": "Click me",
        "body/3": "Button",
      });
    });

    test("handles head section content", async () => {
      const input = `
        <html>
          <head>
            <meta content="Page description">
            <title>Page Title</title>
          </head>
        </html>
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "head/0@content": "Page description",
        "head/1": "Page Title",
      });
    });

    test("skips content in ignored tags", async () => {
      const input = `
        <html>
          <body>
            <div>Visible text</div>
            <script>console.log("hidden")</script>
            <style>.hidden{}</style>
            <noscript>Hidden noscript</noscript>
            <template>Hidden template</template>
          </body>
        </html>
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "body/0": "Visible text",
      });
    });
  });

  describe("serialize", () => {
    test("reconstructs HTML with text content", async () => {
      const translations = {
        "body/0": "Hello",
        "body/1": "World",
      };

      const result = await parser.serialize("en", translations);
      expect(result).toContain("<div>Hello</div>");
      expect(result).toContain("<div>World</div>");
    });

    test("reconstructs HTML with attributes", async () => {
      const translations = {
        "body/0@alt": "Image description",
        "body/0@title": "Image title",
        "body/1@placeholder": "Enter text",
      };

      const result = await parser.serialize("en", translations);
      expect(result).toContain(
        '<img alt="Image description" title="Image title">',
      );
      expect(result).toContain('<input placeholder="Enter text">');
    });

    test("handles head section serialization", async () => {
      const translations = {
        "head/0@content": "Page description",
        "head/1": "Page Title",
      };

      const result = await parser.serialize("en", translations);
      expect(result).toContain('<meta content="Page description">');
      expect(result).toContain("<title>Page Title</title>");
    });

    test("preserves HTML structure with nested elements", async () => {
      const translations = {
        "body/0/0": "Nested",
        "body/0/1": "Content",
      };

      const result = await parser.serialize("en", translations);
      expect(result).toContain(
        "<div><div>Nested</div><div>Content</div></div>",
      );
    });
  });
});
