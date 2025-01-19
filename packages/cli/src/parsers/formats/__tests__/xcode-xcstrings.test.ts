import { describe, expect, it } from "bun:test";
import { createXcodeXcstringsParser } from "../xcode-xcstrings.ts";

describe("Xcode xcstrings parser", () => {
  const parser = createXcodeXcstringsParser();

  describe("parse", () => {
    it("should parse valid xcstrings", async () => {
      const input = JSON.stringify({
        strings: {
          greeting: {
            extractionState: "manual",
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "Hello",
                },
              },
            },
          },
          message: {
            extractionState: "manual",
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "World",
                },
              },
            },
          },
        },
        version: "1.0",
        sourceLanguage: "en",
      });

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        message: "World",
      });
    });

    it("should handle plural variations", async () => {
      const input = JSON.stringify({
        strings: {
          "items.count": {
            extractionState: "manual",
            localizations: {
              en: {
                variations: {
                  plural: {
                    one: {
                      stringUnit: {
                        state: "translated",
                        value: "1 item",
                      },
                    },
                    other: {
                      stringUnit: {
                        state: "translated",
                        value: "%d items",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        version: "1.0",
        sourceLanguage: "en",
      });

      const result = await parser.parse(input);
      expect(result).toEqual({
        "items.count": "1 item",
      });
    });

    it("should handle empty xcstrings", async () => {
      const input = JSON.stringify({
        strings: {},
        version: "1.0",
        sourceLanguage: "en",
      });

      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    it("should throw on invalid JSON", async () => {
      const input = "invalid json";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse Xcode xcstrings translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize object to xcstrings format", async () => {
      const input = {
        greeting: "Hello",
        message: "World",
      };

      const result = await parser.serialize("en", input);
      const parsed = JSON.parse(result);

      expect(parsed.version).toBe("1.0");
      expect(parsed.sourceLanguage).toBe("en");
      expect(parsed.strings.greeting.extractionState).toBe("manual");
      expect(parsed.strings.greeting.localizations.en.stringUnit.value).toBe(
        "Hello",
      );
      expect(parsed.strings.message.localizations.en.stringUnit.value).toBe(
        "World",
      );
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      const parsed = JSON.parse(result);

      expect(parsed.version).toBe("1.0");
      expect(parsed.sourceLanguage).toBe("en");
      expect(parsed.strings).toEqual({});
    });

    it("should throw on serialization error", async () => {
      const input = {
        key: undefined,
      } as unknown as Record<string, string>;

      await expect(parser.serialize("en", input)).rejects.toThrow(
        "Failed to serialize Xcode xcstrings translations",
      );
    });
  });
});
