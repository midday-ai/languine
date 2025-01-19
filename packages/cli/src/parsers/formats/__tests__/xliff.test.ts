import { describe, expect, it } from "bun:test";
import { createXliffParser } from "../xliff.ts";

describe("XLIFF parser", () => {
  const parser = createXliffParser();

  describe("parse", () => {
    it("should parse valid XLIFF", async () => {
      const input = `
        <?xml version="1.0" encoding="UTF-8"?>
        <xliff version="2.0" srcLang="en">
          <file id="namespace">
            <unit id="greeting">
              <segment>
                <source>Hello</source>
              </segment>
            </unit>
            <unit id="nested.message">
              <segment>
                <source>World</source>
              </segment>
            </unit>
          </file>
        </xliff>
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "namespace.greeting": "Hello",
        "namespace.nested.message": "World",
      });
    });

    it("should handle empty XLIFF", async () => {
      const input = `
        <?xml version="1.0" encoding="UTF-8"?>
        <xliff version="2.0" srcLang="en">
          <file id="namespace"></file>
        </xliff>
      `;
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    it("should throw on invalid XLIFF", async () => {
      const input = "<unclosed>";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse XLIFF translations",
      );
    });

    it("should throw on non-object XLIFF", async () => {
      const input = "just text";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse XLIFF translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize flat object to XLIFF", async () => {
      const input = {
        greeting: "Hello",
        "nested.message": "World",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain('xmlns="urn:oasis:names:tc:xliff:document:2.0"');
      expect(result).toContain('version="2.0"');
      expect(result).toContain("<source>Hello</source>");
      expect(result).toContain("<source>World</source>");
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      expect(result).toContain('xmlns="urn:oasis:names:tc:xliff:document:2.0"');
      expect(result).toContain('version="2.0"');
    });

    it("should preserve special characters", async () => {
      const input = {
        message: "Hello & World < > \" '",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain(
        "<source>Hello &amp; World &lt; &gt; \" '</source>",
      );
    });
  });
});
