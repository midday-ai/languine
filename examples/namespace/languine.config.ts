import { defineConfig } from "languine";

export default defineConfig({
  projectId: "",
  locale: {
    source: "en",
    targets: ["es", "fr"],
  },
  files: {
    json: {
      include: ["locales/[locale]/*.json"],
    },
  },
});
