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
  });
});
