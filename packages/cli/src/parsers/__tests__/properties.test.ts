import { describe, expect, test } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("Properties Parser", () => {
  const parser = createParser({ type: "properties" });

  describe("parse", () => {
    test("parses basic key-value pairs", async () => {
      const input = `greeting=Hello
farewell=Goodbye`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        farewell: "Goodbye",
      });
    });

    test("ignores comments and empty lines", async () => {
      const input = `# This is a comment
greeting=Hello

# Another comment
farewell=Goodbye

`;
      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        farewell: "Goodbye",
      });
    });

    test("handles values containing equals signs", async () => {
      const input = "equation=1+1=2";
      const result = await parser.parse(input);
      expect(result).toEqual({
        equation: "1+1=2",
      });
    });

    test("handles empty input", async () => {
      const input = "";
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    test("trims whitespace from keys and values", async () => {
      const input = "  key  =  value  ";
      const result = await parser.parse(input);
      expect(result).toEqual({
        key: "value",
      });
    });
  });

  describe("serialize", () => {
    test("serializes basic key-value pairs", async () => {
      const input = {
        greeting: "Hello",
        farewell: "Goodbye",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe("greeting=Hello\nfarewell=Goodbye\n");
    });

    test("handles empty object", async () => {
      const input = {};
      const result = await parser.serialize("en", input);
      expect(result).toBe("\n");
    });

    test("filters out null/undefined values", async () => {
      const input = {
        valid: "value",
        invalid: null as unknown as string,
        another: undefined as unknown as string,
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe("valid=value\n");
    });

    test("preserves equals signs in values", async () => {
      const input = {
        equation: "1+1=2",
      };
      const result = await parser.serialize("en", input);
      expect(result).toBe("equation=1+1=2\n");
    });
  });
});
