import { describe, expect, it } from "bun:test";
import { createXcodeStringsParser } from "../xcode-strings.ts";

describe("Xcode strings parser", () => {
  const parser = createXcodeStringsParser();

  describe("parse", () => {
    it("should parse valid Xcode strings", async () => {
      const input = `
        "greeting" = "Hello";
        "message" = "World";
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        message: "World",
      });
    });

    it("should handle empty strings file", async () => {
      const result = await parser.parse("");
      expect(result).toEqual({});
    });

    it("should ignore comments", async () => {
      const input = `
        // This is a comment
        "greeting" = "Hello";
        // Another comment
        "message" = "World";
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        message: "World",
      });
    });

    it("should handle escaped characters", async () => {
      const input = `
        "message" = "Hello \\"World\\" with \\n newline";
      `;

      const result = await parser.parse(input);
      expect(result).toEqual({
        message: 'Hello "World" with \n newline',
      });
    });

    it("should throw on invalid syntax", async () => {
      const input = `
        greeting = "Hello"; // Missing quotes around key
      `;

      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse Xcode strings translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize object to Xcode strings format", async () => {
      const input = {
        greeting: "Hello",
        message: "World",
      };

      const result = await parser.serialize("en", input);
      expect(result).toBe(`"greeting" = "Hello";\n"message" = "World";\n`);
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      expect(result).toBe("\n");
    });

    it("should escape special characters", async () => {
      const input = {
        message: 'Hello "World" with \n newline',
      };

      const result = await parser.serialize("en", input);
      expect(result).toBe(
        `"message" = "Hello \\"World\\" with \\n newline";\n`,
      );
    });
  });
});
