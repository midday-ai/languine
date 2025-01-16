import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    yaml: {
      include: ["locales/[locale].yml"],
    },
  },
});
