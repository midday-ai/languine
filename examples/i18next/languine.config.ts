import { defineConfig } from "languine";

export default defineConfig({
  projectId: "h4ap3jhu871n9te26ufe6hd4",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    json: {
      include: ["src/locales/[locale].json"],
    },
  },
});
