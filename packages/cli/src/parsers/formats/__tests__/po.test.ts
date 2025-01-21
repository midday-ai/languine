import { beforeEach, describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";
import type { Parser } from "../../core/types.ts";

describe("PO Parser", () => {
  let parser: Parser;

  beforeEach(() => {
    parser = createParser({ type: "po" });
  });

  describe("parse", () => {
    test("parses simple key-value pairs", async () => {
      const input = `
msgid "hello"
msgstr "world"

msgid "test"
msgstr "value"
`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        hello: "world",
        test: "value",
      });
    });

    test("ignores comments and empty lines", async () => {
      const input = `
# This is a comment
msgid "key"
msgstr "value"

# Another comment

msgid "another"
msgstr "translation"
`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        key: "value",
        another: "translation",
      });
    });

    test("handles empty translations", async () => {
      const input = `
msgid "empty"
msgstr ""
`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        empty: "",
      });
    });

    test("handles quotes in translations", async () => {
      const input = `
msgid "with_quotes"
msgstr "text with "quotes" inside"
`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        with_quotes: 'text with "quotes" inside',
      });
    });

    test("handles empty input", async () => {
      const input = "";
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });
  });

  describe("serialize", () => {
    test("serializes simple key-value pairs", async () => {
      const input = {
        hello: "world",
        test: "value",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        'msgid "hello"\nmsgstr "world"\n\nmsgid "test"\nmsgstr "value"\n',
      );
    });

    test("serializes empty translations", async () => {
      const input = {
        empty: "",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe('msgid "empty"\nmsgstr ""\n');
    });

    test("serializes translations with quotes", async () => {
      const input = {
        with_quotes: 'text with "quotes" inside',
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe(
        'msgid "with_quotes"\nmsgstr "text with "quotes" inside"\n',
      );
    });

    test("handles empty object", async () => {
      const input = {};
      const result = await parser.serialize("en", input);
      expect(result).toBe("");
    });

    test("adds newline at end of file", async () => {
      const input = { key: "value" };
      const result = await parser.serialize("en", input);
      expect(result.endsWith("\n")).toBe(true);
    });
  });
});
