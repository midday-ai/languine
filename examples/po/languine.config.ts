import { defineConfig } from "languine";

export default defineConfig({
  version: "0.6.2",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    po: {
      include: ["locales/[locale].po"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
});
