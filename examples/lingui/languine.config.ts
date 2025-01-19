import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["de"],
  },
  files: {
    po: {
      include: ["locales/[locale]/messages.po"],
    },
  },
});
