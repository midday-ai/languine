import { describe, expect, it } from "bun:test";
import { createParser } from "@/parsers/index.ts";

describe("Markdown parser", () => {
  const parser = createParser({ type: "md" });

  describe("parse", () => {
    it("should parse headings", async () => {
      const input = "# Heading 1\n## Heading 2\n### Heading 3";

      const result = await parser.parse(input);
      expect(result).toEqual({
        "heading.1": "Heading 1",
        "heading.2": "Heading 2",
        "heading.3": "Heading 3",
      });
    });

    it("should parse paragraphs", async () => {
      const input = "First paragraph.\n\nSecond paragraph.";

      const result = await parser.parse(input);
      expect(result).toEqual({
        "paragraph.0": "First paragraph.",
        "paragraph.1": "Second paragraph.",
      });
    });

    it("should parse lists", async () => {
      const input = "- First item\n- Second item\n- Third item";

      const result = await parser.parse(input);
      expect(result).toEqual({
        "list.0": "First item",
        "list.1": "Second item",
        "list.2": "Third item",
      });
    });

    it("should handle empty markdown", async () => {
      const result = await parser.parse("");
      expect(result).toEqual({});
    });

    it("should throw on invalid markdown", async () => {
      const input = null as unknown as string;
      await expect(parser.parse(input)).rejects.toThrow(
        "Failed to parse Markdown translations",
      );
    });
  });

  describe("serialize", () => {
    it("should serialize headings", async () => {
      const input = {
        "heading.1": "Heading 1",
        "heading.2": "Heading 2",
      };

      const result = await parser.serialize("en", input);
      expect(result).toBe("# Heading 1\n## Heading 2\n");
    });

    it("should serialize paragraphs", async () => {
      const input = {
        "paragraph.0": "First paragraph",
        "paragraph.1": "Second paragraph",
      };

      const result = await parser.serialize("en", input);
      expect(result).toBe("First paragraph\n\nSecond paragraph\n\n");
    });

    it("should serialize lists", async () => {
      const input = {
        "list.0": "First item",
        "list.1": "Second item",
      };

      const result = await parser.serialize("en", input);
      expect(result).toBe("- First item\n- Second item\n");
    });

    it("should handle empty object", async () => {
      const result = await parser.serialize("en", {});
      expect(result).toBe("");
    });

    it("should throw on serialization error", async () => {
      const input = {
        invalid: undefined,
      } as unknown as Record<string, string>;

      await expect(parser.serialize("en", input)).rejects.toThrow(
        "Failed to serialize Markdown translations",
      );
    });
  });
});
