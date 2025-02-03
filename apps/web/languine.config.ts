import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: [
      "da",
      "de",
      "es",
      "fi",
      "fr",
      "it",
      "ja",
      "ko",
      "nl",
      "no",
      "pl",
      "pt-BR",
      "pt",
      "sv",
      "zh-CN",
      "zh-TW",
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
