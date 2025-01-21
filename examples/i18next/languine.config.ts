import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "fr"],
  },
  files: {
    json: {
      include: ["locales/[locale].json"],
    },
  },
});
