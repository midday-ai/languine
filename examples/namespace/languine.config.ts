import { defineConfig } from "languine";

export default defineConfig({
  projectId: "",
  locale: {
    source: "en",
    targets: ["es", "fr", "de", "sv"],
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
