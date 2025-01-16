import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["de"],
  },
  files: {
    json: {
      include: ["messages/[locale].json"],
    },
  },
});
