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
      "pt",
      "sv",
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
