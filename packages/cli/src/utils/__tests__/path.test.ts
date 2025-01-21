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
      // Very nested structure
      {
        source: "/workspace/content/docs/guides/en/advanced/features/test.mdx",
        expected: "content/docs/guides/fr/advanced/features/test.mdx",
      },
      // With numbers in path
      {
        source: "/workspace/v2/content/en/docs/test.mdx",
        expected: "v2/content/fr/docs/test.mdx",
      },
      // With dashes in path
      {
        source: "/workspace/my-project/content/en/test.mdx",
        expected: "my-project/content/fr/test.mdx",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en", "fr", WORKSPACE)).toBe(expected);
    }
  });

  it("should transform filename-based locale paths", () => {
    const cases = [
      // Source files (no locale suffix)
      {
        source: "/workspace/content/ui.json",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/ui.fr.json",
      },
      {
        source: "/workspace/content/locales/messages.json",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/locales/messages.fr.json",
      },
      {
        source: "/workspace/content/docs/page.mdx",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/docs/page.fr.mdx",
      },
      // Target files (with locale suffix)
      {
        source: "/workspace/content/ui.fr.json",
        sourceLocale: "fr",
        targetLocale: "es",
        expected: "content/ui.es.json",
      },
      {
        source: "/workspace/content/locales/messages.fr.json",
        sourceLocale: "fr",
        targetLocale: "es",
        expected: "content/locales/messages.es.json",
      },
      {
        source: "/workspace/content/docs/page.fr.mdx",
        sourceLocale: "fr",
        targetLocale: "es",
        expected: "content/docs/page.es.mdx",
      },
      // With numbers in filename
      {
        source: "/workspace/content/page2.json",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/page2.fr.json",
      },
      // With dashes in filename
      {
        source: "/workspace/content/my-page.mdx",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/my-page.fr.mdx",
      },
      // Multiple dots
      {
        source: "/workspace/content/v1.0.json",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/v1.0.fr.json",
      },
      // Underscore in filename
      {
        source: "/workspace/content/my_page.mdx",
        sourceLocale: "",
        targetLocale: "fr",
        expected: "content/my_page.fr.mdx",
      },
    ];

    for (const { source, sourceLocale, targetLocale, expected } of cases) {
      expect(
        transformLocalePath(source, sourceLocale, targetLocale, WORKSPACE),
      ).toBe(expected);
    }
  });

  it("should handle complex locale codes", () => {
    const hyphenCases = [
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
      // BCP 47 tags
      {
        source: "/workspace/content/docs/zh-Hans-CN/test.mdx",
        expected: "content/docs/en-Latn-US/test.mdx",
      },
      // Lowercase and uppercase mix
      {
        source: "/workspace/content/ui.En-Us.json",
        expected: "content/ui.Fr-Ch.json",
      },
    ];

    const underscoreCases = [
      // Directory-based
      {
        source: "/workspace/content/docs/en_US/test.mdx",
        expected: "content/docs/zh_CN/test.mdx",
      },
      // Filename-based
      {
        source: "/workspace/content/ui.en_US.json",
        expected: "content/ui.zh_CN.json",
      },
    ];

    // Test hyphen-based locales
    for (const { source, expected } of hyphenCases) {
      if (source.includes("zh-Hans-CN")) {
        expect(
          transformLocalePath(source, "zh-Hans-CN", "en-Latn-US", WORKSPACE),
        ).toBe(expected);
      } else if (source.includes("En-Us")) {
        expect(transformLocalePath(source, "En-Us", "Fr-Ch", WORKSPACE)).toBe(
          expected,
        );
      } else {
        expect(transformLocalePath(source, "en-US", "zh-CN", WORKSPACE)).toBe(
          expected,
        );
      }
    }

    // Test underscore-based locales
    for (const { source, expected } of underscoreCases) {
      expect(transformLocalePath(source, "en_US", "zh_CN", WORKSPACE)).toBe(
        expected,
      );
    }
  });

  it("should transform .lproj directory paths", () => {
    const cases = [
      // Basic .lproj case
      {
        source: "/workspace/Example/en.lproj/Localizable.stringsdict",
        expected: "Example/fr.lproj/Localizable.stringsdict",
      },
      // Nested .lproj case
      {
        source: "/workspace/Project/Resources/en.lproj/Localizable.stringsdict",
        expected: "Project/Resources/fr.lproj/Localizable.stringsdict",
      },
      // With version number
      {
        source: "/workspace/MyApp/v2/en.lproj/Main.strings",
        expected: "MyApp/v2/fr.lproj/Main.strings",
      },
      // With complex path
      {
        source:
          "/workspace/MyApp/Resources/Base.lproj/en.lproj/Localizable.strings",
        expected: "MyApp/Resources/Base.lproj/fr.lproj/Localizable.strings",
      },
      // Different file extensions
      {
        source: "/workspace/App/en.lproj/Main.storyboard",
        expected: "App/fr.lproj/Main.storyboard",
      },
      {
        source: "/workspace/App/en.lproj/InfoPlist.strings",
        expected: "App/fr.lproj/InfoPlist.strings",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en", "fr", WORKSPACE)).toBe(expected);
    }
  });

  it("should handle paths with no locale", () => {
    const cases = [
      // Basic file
      {
        source: "/workspace/content/docs/test.mdx",
        expected: "content/docs/test.mdx",
      },
      // With locale-like segments that don't match
      {
        source: "/workspace/content/docs/entry/test.mdx",
        expected: "content/docs/entry/test.mdx",
      },
      // With numbers that could be confused with locales
      {
        source: "/workspace/content/docs/2024/test.mdx",
        expected: "content/docs/2024/test.mdx",
      },
      // With locale as part of word
      {
        source: "/workspace/content/docs/sender/test.mdx",
        expected: "content/docs/sender/test.mdx",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en", "fr", WORKSPACE)).toBe(expected);
    }
  });

  it("should handle edge cases", () => {
    const cases = [
      // Multiple locale occurrences in filename
      {
        source: "/workspace/content/en.test.en.mdx",
        expected: "content/en.test.fr.mdx",
      },
      // Locale in directory and filename
      {
        source: "/workspace/content/en/test.en.mdx",
        expected: "content/en/test.fr.mdx",
      },
      // Locale-like segments that shouldn't be replaced
      {
        source: "/workspace/content/frontend/test.mdx",
        expected: "content/frontend/test.mdx",
      },
      // Mixed case paths
      {
        source: "/workspace/Content/Docs/en/Test.mdx",
        expected: "Content/Docs/fr/Test.mdx",
      },
    ];

    for (const { source, expected } of cases) {
      expect(transformLocalePath(source, "en", "fr", WORKSPACE)).toBe(expected);
    }
  });
});
