import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "fr"],
  },
  files: {
    yaml: {
      include: ["locales/[locale].yml"],
    },
  },
});
