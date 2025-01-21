import { describe, expect, it } from "bun:test";
import { transformLocalePath } from "../path.js";

describe("transformLocalePath", () => {
  const WORKSPACE = "/workspace";

  it("should transform directory-based locale paths", () => {
    const cases = [
      // Basic case
      {
        source: "/workspace/content/docs/en/test.mdx",
        expected: "content/docs/fr/test.mdx",
      },
      // Nested directories
      {
        source: "/workspace/content/docs/en/guide/intro.mdx",
        expected: "content/docs/fr/guide/intro.mdx",
      },
      // Multiple locale-like segments
      {
        source: "/workspace/content/en/docs/en/test.mdx",
        expected: "content/en/docs/fr/test.mdx",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en", "fr", WORKSPACE)).toBe(expected);
    }
  });

  it("should transform filename-based locale paths", () => {
    const cases = [
      // Basic case
      {
        source: "/workspace/content/ui.en.json",
        expected: "content/ui.fr.json",
      },
      // Nested directory
      {
        source: "/workspace/content/locales/messages.en.json",
        expected: "content/locales/messages.fr.json",
      },
      // Multiple extensions
      {
        source: "/workspace/content/docs/page.en.mdx",
        expected: "content/docs/page.fr.mdx",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en", "fr", WORKSPACE)).toBe(expected);
    }
  });

  it("should handle complex locale codes", () => {
    const cases = [
      // Directory-based
      {
        source: "/workspace/content/docs/en-US/test.mdx",
        expected: "content/docs/zh-CN/test.mdx",
      },
      // Filename-based
      {
        source: "/workspace/content/ui.en-US.json",
        expected: "content/ui.zh-CN.json",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en-US", "zh-CN", WORKSPACE)).toBe(
        expected,
      );
    }
  });

  it("should handle paths with no locale", () => {
    const source = "/workspace/content/docs/test.mdx";
    const result = transformLocalePath(source, "en", "fr", WORKSPACE);
    expect(result).toBe("content/docs/test.mdx");
  });
});
