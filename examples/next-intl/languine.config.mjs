export default {
  version: "1.0.0",
  locale: {
    source: "en",
    targets: ["de"],
  },
  files: {
    json: {
      include: ["messages/[locale].json"],
    },
  },
  openai: {
    model: "gpt-4-turbo",
  },
};
