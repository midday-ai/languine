import { describe, expect, it } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("Android XML parser", () => {
  const parser = createParser({ type: "android" });

  describe("parse", () => {
    it("should parse valid Android XML", async () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Navigation -->
    <string name="nav_home">Home</string>
    <string name="nav_search">Search</string>
    <string name="nav_favorites">Favorites</string>
    <string name="nav_settings">Settings</string>
</resources>`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        nav_home: "Home",
        nav_search: "Search",
        nav_favorites: "Favorites",
        nav_settings: "Settings",
      });
    });

    it("should parse plurals", async () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <plurals name="media_queue">
        <item quantity="one">%d song in queue</item>
        <item quantity="other">%d songs in queue</item>
    </plurals>
</resources>`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "media_queue[one]": "%d song in queue",
        "media_queue[other]": "%d songs in queue",
      });
    });

    it("should parse string arrays", async () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string-array name="payment_methods">
        <item>Credit Card</item>
        <item>PayPal</item>
        <item>Bank Transfer</item>
    </string-array>
</resources>`;

      const result = await parser.parse(input);
      expect(result).toEqual({
        "payment_methods[0]": "Credit Card",
        "payment_methods[1]": "PayPal",
        "payment_methods[2]": "Bank Transfer",
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
        nav_home: "Home",
        nav_search: "Search",
        nav_favorites: "Favorites",
        nav_settings: "Settings",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<string name="nav_home">Home</string>');
      expect(result).toContain('<string name="nav_search">Search</string>');
      expect(result).toContain(
        '<string name="nav_favorites">Favorites</string>',
      );
      expect(result).toContain('<string name="nav_settings">Settings</string>');
    });

    it("should serialize plurals", async () => {
      const input = {
        "media_queue[one]": "%d song in queue",
        "media_queue[other]": "%d songs in queue",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<plurals name="media_queue">');
      expect(result).toContain('<item quantity="one">%d song in queue</item>');
      expect(result).toContain(
        '<item quantity="other">%d songs in queue</item>',
      );
      expect(result).toContain("</plurals>");
    });

    it("should serialize string arrays", async () => {
      const input = {
        "payment_methods[0]": "Credit Card",
        "payment_methods[1]": "PayPal",
        "payment_methods[2]": "Bank Transfer",
      };

      const result = await parser.serialize("en", input);
      expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
      expect(result).toContain('<string-array name="payment_methods">');
      expect(result).toContain("<item>Credit Card</item>");
      expect(result).toContain("<item>PayPal</item>");
      expect(result).toContain("<item>Bank Transfer</item>");
      expect(result).toContain("</string-array>");
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
