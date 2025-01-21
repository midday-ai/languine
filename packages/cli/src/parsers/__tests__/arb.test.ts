import { beforeEach, describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";
import type { Parser } from "../core/types.ts";

describe("ARB parser", () => {
  let parser: Parser;

  beforeEach(() => {
    parser = createParser({ type: "arb" });
  });

  describe("parse", () => {
    test("should parse valid ARB file", async () => {
      const input = `{
        "@@locale": "en",
        "hello": "world",
        "test": "value"
      }`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        hello: "world",
        test: "value",
      });
    });

    test("should handle empty ARB file", async () => {
      const input = "{}";
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    test("should throw on invalid JSON", async () => {
      const input = "{invalid json}";
      await expect(parser.parse(input)).rejects.toThrow();
    });
  });

  describe("serialize", () => {
    test("should serialize flat object", async () => {
      const input = {
        hello: "world",
        test: "value",
      };
      const result = await parser.serialize("en", input);
      expect(JSON.parse(result)).toEqual({
        "@@locale": "en",
        hello: "world",
        test: "value",
      });
    });

    test("should handle empty object", async () => {
      const input = {};
      const result = await parser.serialize("en", input);
      expect(JSON.parse(result)).toEqual({
        "@@locale": "en",
      });
    });

    test("removes deleted keys when serializing", async () => {
      const translations = {
        greeting: "Hello",
        farewell: "Goodbye",
      };
      const result = await parser.serialize("en", translations);
      expect(JSON.parse(result)).toEqual({
        "@@locale": "en",
        greeting: "Hello",
        farewell: "Goodbye",
      });
    });

    test("handles object with no translations", async () => {
      const translations = {};
      const result = await parser.serialize("en", translations);
      expect(JSON.parse(result)).toEqual({
        "@@locale": "en",
      });
    });
  });
});
