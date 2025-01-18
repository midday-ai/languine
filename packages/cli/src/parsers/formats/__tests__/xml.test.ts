import { describe, expect, it } from "bun:test";
import { createXmlParser } from "../xml.ts";

describe("XML parser", () => {
  const parser = createXmlParser();

  describe("parse", () => {
    it("should parse valid XML", async () => {
      const input = `
        <root>
          <greeting>Hello</greeting>
          <nested>
            <message>World</message>
          </nested>
        </root>
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "root.greeting": "Hello",
        "root.nested.message": "World",
      });
    });

    it("should handle empty XML", async () => {
      const input = "<root></root>";
      const result = await parser.parse(input);
      expect(result).toEqual({ root: "" });
    });

    it("should throw on invalid XML", async () => {
      const input = "<unclosed>";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse XML translations",
      );
    });

    it("should throw on non-object XML", async () => {
      const input = "just text";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse XML translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize flat object to nested XML", async () => {
      const input = {
        "root.greeting": "Hello",
        "root.nested.message": "World",
      };

      const result = await parser.serialize(input);
      expect(result).toBe(
        "<root><greeting>Hello</greeting><nested><message>World</message></nested></root>",
      );
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize({});
      expect(result).toBe("<root/>");
    });

    it("should preserve special characters", async () => {
      const input = {
        "root.message": "Hello & World < > \" '",
      };

      const result = await parser.serialize(input);
      expect(result).toBe(
        "<root><message>Hello &amp; World &lt; &gt; &quot; &apos;</message></root>",
      );
    });

    it("should handle deeply nested structures", async () => {
      const input = {
        "root.level1.level2.level3.message": "Deep",
      };

      const result = await parser.serialize(input);
      expect(result).toBe(
        "<root><level1><level2><level3><message>Deep</message></level3></level2></level1></root>",
      );
    });
  });
});
