import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["sv", "de"],
  },
  files: {
    ts: {
      include: ["locales/[locale].ts"],
    },
  },
});
