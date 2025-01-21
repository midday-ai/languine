import { describe, expect, it } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("ARB parser", () => {
  const parser = createParser({ type: "arb" });

  describe("parse", () => {
    it("should parse valid ARB file", async () => {
      const input = `{
        "@@locale": "en",
        "greeting": "Hello",
        "@greeting": {
          "description": "A greeting message"
        },
        "message": "World",
        "@message": {
          "description": "A message"
        }
      }`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        message: "World",
      });
    });

    it("should handle empty ARB file", async () => {
      const input = "{}";
      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    it("should throw on invalid JSON", async () => {
      const input = "invalid json content";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse ARB translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize translations to ARB format", async () => {
      const input = {
        greeting: "Hello",
        message: "World",
      };

      const result = await parser.serialize("en", input);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        "@@locale": "en",
        greeting: "Hello",
        message: "World",
      });
    });

    it("should handle empty translations", async () => {
      const input = {};
      const result = await parser.serialize("fr", input);
      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        "@@locale": "fr",
      });
    });
  });
});
