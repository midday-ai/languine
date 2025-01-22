import { defineConfig } from "languine";

export default defineConfig({
  projectId: "",
  locale: {
    source: "en",
    targets: ["sv"],
  },
  files: {
    md: {
      include: ["blog/[locale]/*.md"],
    },
  },
});
