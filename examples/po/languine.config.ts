import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    po: {
      include: ["locales/[locale].po"],
    },
  },
});
