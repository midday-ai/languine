import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: [
      "es",
      "sv",
      "de",
      "fr",
      "fi",
      "pt",
      "ja",
      "zh",
      "ko",
      "no",
      "it",
      "ar",
      "nl",
      "pl",
      "tr",
      "vi",
    ],
  },
  files: {
    json: {
      include: ["src/messages/[locale].json"],
    },
    mdx: {
      include: ["src/markdown/docs/en/*.mdx"],
    },
  },
});
