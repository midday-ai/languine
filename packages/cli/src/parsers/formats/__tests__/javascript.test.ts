import { describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("JavaScript/TypeScript Parser", () => {
  const parser = createParser({ type: "js" });

  describe("parse", () => {
    test("parses simple object", async () => {
      const input = `{ "hello": "world" }`;
      const result = await parser.parse(input);
      expect(result).toEqual({ hello: "world" });
    });

    test("parses nested object", async () => {
      const input = `{
        nested: {
          key: "value",
          deeper: {
            another: "test"
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "nested.key": "value",
        "nested.deeper.another": "test",
      });
    });

    test("handles export default", async () => {
      const input = `export default {
        key: "value"
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({ key: "value" });
    });

    test("handles as const", async () => {
      const input = `{
        key: "value"
      } as const`;
      const result = await parser.parse(input);
      expect(result).toEqual({ key: "value" });
    });

    test("handles export default with as const", async () => {
      const input = `export default {
        key: "value"
      } as const`;
      const result = await parser.parse(input);
      expect(result).toEqual({ key: "value" });
    });

    test("parses pluralization keys", async () => {
      const input = `{
        "cows#one": "A cow",
        "cows#other": "{count} cows"
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "cows#one": "A cow",
        "cows#other": "{count} cows",
      });
    });

    test("parses deeply nested scopes", async () => {
      const input = `{
        scope: {
          more: {
            and: {
              more: {
                test: "A scope"
              }
            }
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "scope.more.and.more.test": "A scope",
      });
    });

    test("parses interpolation parameters", async () => {
      const input = `{
        welcome: "Hello {name}!",
        "about.you": "Hello {name}! You are {age} years old"
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        welcome: "Hello {name}!",
        "about.you": "Hello {name}! You are {age} years old",
      });
    });

    test("throws on invalid JavaScript syntax", async () => {
      const input = "{ invalid: syntax: }";
      await expect(parser.parse(input)).rejects.toThrow(
        "Invalid JavaScript syntax",
      );
    });

    test("throws on non-object input", async () => {
      const input = `"just a string"`;
      await expect(parser.parse(input)).rejects.toThrow(
        "Translation file must export an object",
      );
    });

    test("throws on non-string values", async () => {
      const input = "{ key: 123 }";
      await expect(parser.parse(input)).rejects.toThrow(
        "Invalid translation value",
      );
    });
  });

  describe("serialize", () => {
    test("serializes flat object", async () => {
      const input = { key: "value" };
      const result = await parser.serialize("en", input);
      expect(result).toBe(`export default {\n  key: "value"\n} as const;\n`);
    });

    test("serializes nested keys", async () => {
      const input = {
        "nested.key": "value",
        "nested.deeper.another": "test",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        `export default {\n  nested: {\n    key: "value",\n    deeper: {\n      another: "test"\n    }\n  }\n} as const;\n`,
      );
    });

    test("preserves quotes in text content", async () => {
      const input = { key: 'value with "quotes"' };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        `export default {\n  key: "value with \\"quotes\\""\n} as const;\n`,
      );
    });

    test("handles empty object", async () => {
      const input = {};
      const result = await parser.serialize("en", input);
      expect(result).toBe("export default {} as const;\n");
    });

    test("serializes pluralization keys", async () => {
      const input = {
        "cows#one": "A cow",
        "cows#other": "{count} cows",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        `export default {\n  "cows#one": "A cow",\n  "cows#other": "{count} cows"\n} as const;\n`,
      );
    });

    test("round trip test", async () => {
      const original = {
        simple: "value",
        "nested.key": "nested value",
        "very.deep.structure.key": "deep value",
      };
      const serialized = await parser.serialize("en", original);
      const parsed = await parser.parse(serialized);
      expect(parsed).toEqual(original);
    });

    test("round trip with pluralization and parameters", async () => {
      const original = {
        "scope.more.stars#one": "1 star on GitHub",
        "scope.more.stars#other": "{count} stars on GitHub",
        "scope.more.param": "A scope with {param}",
      };
      const serialized = await parser.serialize("en", original);
      const parsed = await parser.parse(serialized);
      expect(parsed).toEqual(original);
    });
  });
});
