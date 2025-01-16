import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    json: {
      include: ["locales/native/[locale].json", "locales/[locale].json"],
    },
  },
});
