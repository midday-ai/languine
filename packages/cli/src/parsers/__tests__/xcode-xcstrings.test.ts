import { describe, expect, it } from "bun:test";
import { createParser } from "@/parsers/index.ts";
import JSON5 from "json5";

describe("Xcode xcstrings parser", () => {
  const parser = createParser({ type: "xcode-xcstrings" });

  describe("parse", () => {
    it("should parse valid xcstrings", async () => {
      const input = JSON5.stringify({
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
      const input = JSON5.stringify({
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
      const input = JSON5.stringify({
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

    it("should handle trailing commas in JSON", async () => {
      const input = `{
        "version": "1.0",
        "sourceLanguage": "en",
        "strings": {
          "complex_format": {
            "localizations": {
              "en": {
                "stringUnit": {
                  "state": "translated",
                  "value": "User %1$@ has %2$lld points",
                },
              },
            },
            "extractionState": "manual",
          },
        },
      }`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        complex_format: "User %1$@ has %2$lld points",
      });
    });
  });

  describe("serialize", () => {
    it("should add new locale while preserving source locale", async () => {
      const originalData = JSON5.stringify({
        sourceLanguage: "en",
        version: "1.0",
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
      });

      const frTranslations = {
        greeting: "Bonjour",
        message: "Monde",
      };

      const result = await parser.serialize("fr", frTranslations, originalData);
      const parsed = JSON5.parse(result);

      // Verify source language is preserved
      expect(parsed.sourceLanguage).toBe("en");

      // Verify both locales exist
      expect(parsed.strings.greeting.localizations.en.stringUnit.value).toBe(
        "Hello",
      );
      expect(parsed.strings.greeting.localizations.fr.stringUnit.value).toBe(
        "Bonjour",
      );
      expect(parsed.strings.message.localizations.en.stringUnit.value).toBe(
        "World",
      );
      expect(parsed.strings.message.localizations.fr.stringUnit.value).toBe(
        "Monde",
      );
    });

    it("should create new file with correct structure when no original data", async () => {
      const input = {
        greeting: "Hello",
        message: "World",
      };

      const result = await parser.serialize("en", input);
      const parsed = JSON5.parse(result);

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
      const parsed = JSON5.parse(result);

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
