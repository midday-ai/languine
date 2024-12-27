import { Biome, Distribution } from "@biomejs/js-api";
import { defineConfig } from "languine";

const biome = await Biome.create({
  distribution: Distribution.NODE,
});

export default defineConfig({
  version: "1.0.0",
  locale: {
    source: "en",
    targets: ["de"],
  },
  files: {
    json: {
      include: ["locales/[locale].json"],
    },
  },
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
  },
  hooks: {
    // Optional: Format the content with Biome
    afterTranslate: async ({ content, filePath }) => {
      const formatted = biome.formatContent(content.toString(), {
        filePath,
      });

      return formatted.content;
    },
  },
});
