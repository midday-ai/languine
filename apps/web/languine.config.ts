import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "fr", "de", "ja", "zh", "ar", "ko", "sv", "no", "fi", "pt"],
  },
  files: {
    ts: {
      include: ["src/locales/[locale].ts"],
    },
  },
});
