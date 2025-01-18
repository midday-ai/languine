import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es", "sv", "de", "fr"],
  },
  files: {
    ts: {
      include: ["src/locales/[locale].ts"],
    },
  },
});
