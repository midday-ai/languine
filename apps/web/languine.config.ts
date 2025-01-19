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
    ts: {
      include: ["src/locales/[locale].ts"],
    },
  },
});
