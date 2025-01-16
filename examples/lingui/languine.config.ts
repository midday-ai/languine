import { Biome, Distribution } from "@biomejs/js-api";
import { defineConfig } from "languine";

const biome = await Biome.create({
  distribution: Distribution.NODE,
});

export default defineConfig({
  locale: {
    source: "en",
    targets: ["de"],
  },
  files: {
    json: {
      include: ["locales/[locale].json"],
    },
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
