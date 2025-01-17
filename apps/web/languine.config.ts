import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    ts: {
      include: ["src/locales/[locale].ts"],
    },
  },
});
