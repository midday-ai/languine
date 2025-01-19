import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "sv", "de", "fr", "fi", "pt"],
  },
  files: {
    ts: {
      include: ["src/locales/[locale].ts"],
    },
  },
});
