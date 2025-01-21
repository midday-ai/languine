import { beforeEach, describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";
import type { Parser } from "../core/types.ts";

describe("YAML parser", () => {
  let parser: Parser;

  beforeEach(() => {
    parser = createParser({ type: "yaml" });
  });

  describe("parse", () => {
    test("should parse valid YAML", async () => {
      const input = "hello: world\ntest: value\n";
      const result = await parser.parse(input);
      expect(result).toEqual({
        hello: "world",
        test: "value",
      });
    });

    test("should handle empty YAML", async () => {
      const input = "";
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    test("should throw on invalid YAML", async () => {
      const input = "invalid: yaml: : :";
      await expect(parser.parse(input)).rejects.toThrow();
    });

    test("should throw on non-object YAML", async () => {
      const input = "just a string";
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
      expect(result).toBe("hello: world\ntest: value\n");
    });

    test("should handle empty object", async () => {
      const input = {};
      const result = await parser.serialize("en", input);
      expect(result).toBe("{}\n");
    });

    test("removes deleted keys when serializing", async () => {
      const translations = {
        greeting: "Hello",
        farewell: "Goodbye",
      };
      const result = await parser.serialize("en", translations);
      expect(result).toBe("greeting: Hello\nfarewell: Goodbye\n");
    });

    test("handles object with no translations", async () => {
      const translations = {};
      const result = await parser.serialize("en", translations);
      expect(result).toBe("{}\n");
    });
  });
});
