import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    android: {
      include: ["locales/[locale].xml"],
    },
  },
});
