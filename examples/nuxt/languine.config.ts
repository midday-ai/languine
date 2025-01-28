import { defineConfig } from "languine";

export default defineConfig({
  projectId: "prj_cfqrijaze5fcndopqzh9ljwp",
  locale: {
    source: "en",
    targets: ["es", "fr", "de", "sv"],
  },
  files: {
    json: {
      include: ["src/i18n/locales/[locale].json"],
    },
  },
});
