import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "sv", "pt"],
  },
  files: {
    json: {
      include: ["locales/[locale].json"],
    },
  },
  extract: ["./emails/**/*.tsx"],
});
