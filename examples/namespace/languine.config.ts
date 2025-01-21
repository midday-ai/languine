import { defineConfig } from "languine";

export default defineConfig({
  projectId: "",
  locale: {
    source: "en",
    targets: ["es", "fr"],
  },
  files: {
    // json: {
    //   include: ["locales/[locale]/*.json"],
    // },
    md: {
      include: ["docs/[locale]/*.md"],
    },
  },
});
