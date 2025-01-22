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

    test("preserves explicit dot notation keys while flattening nested objects", async () => {
      const input = `{
        "about.you": "Hello {name}! You are {age} years old",
        nested: {
          key: "value",
          deeper: {
            another: "test"
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "about.you": "Hello {name}! You are {age} years old",
        "nested.key": "value",
        "nested.deeper.another": "test",
      });
    });

    test("handles mix of explicit dot notation and nested objects with same prefix", async () => {
      const input = `{
        "scope.test": "A scope",
        scope: {
          more: {
            test: "Another scope"
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "scope.test": "A scope",
        "scope.more.test": "Another scope",
      });
    });

    test("preserves explicit dot notation in complex scenarios", async () => {
      const input = `{
        "very.deep.key": "Explicit deep key",
        very: {
          deep: {
            nested: "Nested value",
            "other.key": "Mixed nesting"
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "very.deep.key": "Explicit deep key",
        "very.deep.nested": "Nested value",
        "very.deep.other.key": "Mixed nesting",
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

    test("serializes dot notation keys", async () => {
      const input = {
        "nested.key": "value",
        "nested.deeper.another": "test",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        `export default {\n  "nested.key": "value",\n  "nested.deeper.another": "test"\n} as const;\n`,
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

    test("serializes complex keys with dots and parameters", async () => {
      const input = {
        "scope.more.stars#one": "1 star on GitHub",
        "scope.more.stars#other": "{count} stars on GitHub",
        "scope.more.param": "A scope with {param}",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        `export default {\n  "scope.more.stars#one": "1 star on GitHub",\n  "scope.more.stars#other": "{count} stars on GitHub",\n  "scope.more.param": "A scope with {param}"\n} as const;\n`,
      );
    });

    test("maintains same structure as original file", async () => {
      const originalData = {
        hello: "Hello",
        welcome: "Hello {name}!",
        "about.you": "Hello {name}! You are {age} years old",
        "scope.test": "A scope",
        "scope.more.test": "A scope",
        "scope.more.param": "A scope with {param}",
        "scope.more.and.more.test": "A scope",
        "scope.more.stars#one": "1 star on GitHub",
        "scope.more.stars#other": "{count} stars on GitHub",
      };

      const input = {
        hello: "Bonjour",
        welcome: "Bonjour {name} !",
        "about.you": "Bonjour {name} ! Vous avez {age} ans",
        "scope.test": "Un domaine",
        "scope.more.test": "Un domaine",
        "scope.more.param": "Un domaine avec {param}",
        "scope.more.and.more.test": "Un domaine",
        "scope.more.stars#one": "1 étoile sur GitHub",
        "scope.more.stars#other": "{count} étoiles sur GitHub",
      };

      const result = await parser.serialize("fr", input, originalData);
      expect(result).toBe(
        `export default {\n  hello: "Bonjour",\n  welcome: "Bonjour {name} !",\n  "about.you": "Bonjour {name} ! Vous avez {age} ans",\n  "scope.test": "Un domaine",\n  "scope.more.test": "Un domaine",\n  "scope.more.param": "Un domaine avec {param}",\n  "scope.more.and.more.test": "Un domaine",\n  "scope.more.stars#one": "1 étoile sur GitHub",\n  "scope.more.stars#other": "{count} étoiles sur GitHub"\n} as const;\n`,
      );
    });
  });
});
