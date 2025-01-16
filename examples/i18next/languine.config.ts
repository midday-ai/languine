import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["sv"],
  },
  files: {
    json: {
      include: ["locales/[locale].json"],
    },
  },
});
