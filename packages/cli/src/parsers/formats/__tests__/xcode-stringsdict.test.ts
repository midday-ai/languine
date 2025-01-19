import { describe, expect, it } from "bun:test";
import { createXcodeStringsDictParser } from "../../formats/xcode-stringsdict.ts";

describe("Xcode stringsdict parser", () => {
  const parser = createXcodeStringsDictParser();

  describe("parse", () => {
    it("should parse valid stringsdict plist", async () => {
      const input = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>greeting</key>
  <string>Hello</string>
  <key>message</key>
  <string>World</string>
</dict>
</plist>`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        message: "World",
      });
    });

    it("should parse plural rules in stringsdict plist", async () => {
      const input = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items_count</key>
  <dict>
    <key>NSStringLocalizedFormatKey</key>
    <string>%#@items@</string>
    <key>items</key>
    <dict>
      <key>NSStringFormatSpecTypeKey</key>
      <string>NSStringPluralRuleType</string>
      <key>NSStringFormatValueTypeKey</key>
      <string>lld</string>
      <key>zero</key>
      <string>No items</string>
      <key>one</key>
      <string>One item</string>
      <key>other</key>
      <string>%lld items</string>
    </dict>
  </dict>
  <key>simple</key>
  <string>Simple string</string>
</dict>
</plist>`;

      const result = await parser.parse(input);
      expect(result.simple).toBe("Simple string");
      const itemsCount = JSON.parse(result.items_count);
      expect(itemsCount.NSStringLocalizedFormatKey).toBe("%#@items@");
      expect(itemsCount.items.NSStringFormatSpecTypeKey).toBe(
        "NSStringPluralRuleType",
      );
      expect(itemsCount.items.zero).toBe("No items");
      expect(itemsCount.items.one).toBe("One item");
      expect(itemsCount.items.other).toBe("%lld items");
    });

    it("should handle empty plist", async () => {
      const input = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
</dict>
</plist>`;

      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    it("should ignore non-string values", async () => {
      const input = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>greeting</key>
  <string>Hello</string>
  <key>count</key>
  <integer>42</integer>
  <key>enabled</key>
  <true/>
</dict>
</plist>`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
      });
    });

    it("should throw on invalid plist", async () => {
      const input = "invalid plist content";

      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse Xcode stringsdict translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize object to stringsdict plist format", async () => {
      const input = {
        greeting: "Hello",
        message: "World",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain("<key>greeting</key>");
      expect(result).toContain("<string>Hello</string>");
      expect(result).toContain("<key>message</key>");
      expect(result).toContain("<string>World</string>");
    });

    it("should serialize object with plural rules to stringsdict plist format", async () => {
      const pluralRule = {
        NSStringLocalizedFormatKey: "%#@items@",
        items: {
          NSStringFormatSpecTypeKey: "NSStringPluralRuleType",
          NSStringFormatValueTypeKey: "lld",
          zero: "No items",
          one: "One item",
          other: "%lld items",
        },
      };

      const input = {
        items_count: JSON.stringify(pluralRule),
        simple: "Simple string",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain("<key>items_count</key>");
      expect(result).toContain("<key>NSStringLocalizedFormatKey</key>");
      expect(result).toContain("<string>%#@items@</string>");
      expect(result).toContain("<key>NSStringFormatSpecTypeKey</key>");
      expect(result).toContain("<string>NSStringPluralRuleType</string>");
      expect(result).toContain("<key>zero</key>");
      expect(result).toContain("<string>No items</string>");
      expect(result).toContain("<key>simple</key>");
      expect(result).toContain("<string>Simple string</string>");
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      expect(result).toContain("<dict/>");
    });

    it("should throw on serialization error", async () => {
      // Create an object that can't be serialized to plist
      const input = {
        key: Symbol("test"),
      } as unknown as Record<string, string>;

      await expect(parser.serialize("en", input)).rejects.toThrow(
        'Failed to serialize Xcode stringsdict translations: Value for key "key" must be a string',
      );
    });

    it("should serialize remaining time format", async () => {
      const input = {
        remaining_time: "Tiempo restante: %1$@ (%2$lld segundos)",
        version_info: "Versión %1$@ (Compilación %2$@)",
        test: "Prueba",
      };

      const result = await parser.serialize("es", input);
      expect(result).toContain("<key>remaining_time</key>");
      expect(result).toContain(
        "<string>Tiempo restante: %1$@ (%2$lld segundos)</string>",
      );
      expect(result).toContain("<key>version_info</key>");
      expect(result).toContain(
        "<string>Versión %1$@ (Compilación %2$@)</string>",
      );
      expect(result).toContain("<key>test</key>");
      expect(result).toContain("<string>Prueba</string>");
    });
  });
});
