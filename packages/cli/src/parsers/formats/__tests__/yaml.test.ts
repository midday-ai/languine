import { describe, expect, it } from "bun:test";
import { createYamlParser } from "../yaml.ts";

describe("YAML parser", () => {
  const parser = createYamlParser();

  describe("parse", () => {
    it("should parse valid YAML", async () => {
      const input = `
greeting: Hello
nested:
  message: World
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        "nested.message": "World",
      });
    });

    it("should handle empty YAML", async () => {
      const result = await parser.parse("");
      expect(result).toEqual({});
    });

    it("should throw on invalid YAML", async () => {
      const input = `
greeting: "unclosed string
      `;

      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse YAML translations",
      );
    });

    it("should throw on non-object YAML", async () => {
      const input = "just a string";

      await expect(parser.parse(input)).rejects.toThrow(
        "Translation file must contain a YAML object",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize flat object to nested YAML", async () => {
      const input = {
        greeting: "Hello",
        "nested.message": "World",
      };

      const result = await parser.serialize("en", input);
      expect(result).toBe("greeting: Hello\nnested:\n  message: World\n");
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      expect(result).toBe("{}\n");
    });
  });
});
