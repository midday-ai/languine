import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["sv"],
  },
  files: {
    ts: {
      include: ["locales/[locale].ts"],
    },
  },
});
