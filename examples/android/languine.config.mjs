export default {
  version: "0.6.8",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    android: {
      include: ["locales/[locale].xml"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
};
