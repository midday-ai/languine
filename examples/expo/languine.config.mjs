export default {
  version: "0.6.4",
  locale: {
    source: "en",
    targets: ["es"],
  },
  files: {
    json: {
      include: ["locales/native/[locale].json","locales/[locale].json"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
}