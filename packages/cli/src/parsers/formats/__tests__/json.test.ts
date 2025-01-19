import { beforeEach, describe, expect, test } from "bun:test";
import type { Parser } from "../../core/types.ts";
import { createJsonParser } from "../json.ts";

describe("JSON Parser", () => {
  let parser: Parser;

  beforeEach(() => {
    parser = createJsonParser();
  });

  describe("parse", () => {
    test("parses simple key-value pairs", async () => {
      const input = `{
        "hello": "world",
        "test": "value"
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        hello: "world",
        test: "value",
      });
    });

    test("parses nested objects", async () => {
      const input = `{
        "nested": {
          "key": "value",
          "another": {
            "deep": "test"
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "nested.key": "value",
        "nested.another.deep": "test",
      });
    });

    test("repairs malformed JSON", async () => {
      const input = `{
        hello: "world",
        'test': 'value'
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        hello: "world",
        test: "value",
      });
    });

    test("throws on non-object input", async () => {
      const input = `"just a string"`;
      await expect(parser.parse(input)).rejects.toThrow(
        "Translation file must contain a JSON object",
      );
    });

    test("throws on non-string values", async () => {
      const input = `{
        "key": 123
      }`;
      await expect(parser.parse(input)).rejects.toThrow(
        "Invalid translation value",
      );
    });

    test("handles empty object", async () => {
      const input = "{}";
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    test("parses deeply nested structures", async () => {
      const input = `{
        "a": {
          "b": {
            "c": {
              "d": "value"
            }
          }
        }
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "a.b.c.d": "value",
      });
    });

    test("handles special characters in keys", async () => {
      const input = `{
        "special@key": "value",
        "with spaces": "test",
        "with.dot": "works"
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        "special@key": "value",
        "with spaces": "test",
        "with.dot": "works",
      });
    });
  });

  describe("serialize", () => {
    test("serializes flat object", async () => {
      const input = {
        hello: "world",
        test: "value",
      };
      const result = await parser.serialize("en", input);
      expect(JSON.parse(result)).toEqual({
        hello: "world",
        test: "value",
      });
    });

    test("serializes nested keys", async () => {
      const input = {
        "nested.key": "value",
        "nested.another.deep": "test",
      };
      const result = await parser.serialize("en", input);
      expect(JSON.parse(result)).toEqual({
        nested: {
          key: "value",
          another: {
            deep: "test",
          },
        },
      });
    });

    test("preserves special characters", async () => {
      const input = {
        "special@key": "value",
        "with spaces": "test",
      };
      const result = await parser.serialize("en", input);
      expect(JSON.parse(result)).toEqual({
        "special@key": "value",
        "with spaces": "test",
      });
    });

    test("handles empty object", async () => {
      const input = {};
      const result = await parser.serialize("en", input);
      expect(JSON.parse(result)).toEqual({});
    });

    test("adds newline at end of file", async () => {
      const input = { key: "value" };
      const result = await parser.serialize("en", input);
      expect(result.endsWith("\n")).toBe(true);
    });
  });
});
