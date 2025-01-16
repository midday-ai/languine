import { defineConfig } from "languine";

export default defineConfig({
  locale: {
    source: "en",
    targets: ["fr"],
  },
  files: {
    ts: {
      include: ["locales/[locale].ts"],
    },
  },
});
