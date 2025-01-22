import { defineConfig } from "languine";

export default defineConfig({
  projectId: "",
  locale: {
    source: "en",
    targets: ["sv"],
  },
  files: {
    mdx: {
      include: ["blog/[locale]/*.mdx"],
    },
    md: {
      include: ["blog/[locale]/*.md"],
    },
  },
});
