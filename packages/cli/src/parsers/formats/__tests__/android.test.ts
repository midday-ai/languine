import { describe, expect, it } from "bun:test";
import { createAndroidParser } from "../android.ts";

describe("Android XML parser", () => {
  const parser = createAndroidParser();

  describe("parse", () => {
    it("should parse valid Android XML", async () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="greeting">Hello</string>
    <string name="message">World</string>
</resources>`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        greeting: "Hello",
        message: "World",
      });
    });

    it("should handle empty resources", async () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
</resources>`;

      const result = await parser.parse(input);
      expect(result).toEqual({});
    });

    it("should throw on invalid XML", async () => {
      const input = "invalid xml content";
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse Android XML translations",
      );
    });

    it("should throw on missing resources tag", async () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
<wrong>
    <string name="greeting">Hello</string>
</wrong>`;

      await expect(parser.parse(input)).rejects.toThrow(
        "Translation file must contain valid Android resources",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize object to Android XML format", async () => {
      const input = {
        greeting: "Hello",
        message: "World",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<string name="greeting">Hello</string>');
      expect(result).toContain('<string name="message">World</string>');
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain("<resources/>");
    });

    it("should preserve special characters", async () => {
      const input = {
        message: "Hello & World < > \" '",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain(
        '<string name="message">Hello &amp; World &lt; &gt; " \'</string>',
      );
    });
  });
});
