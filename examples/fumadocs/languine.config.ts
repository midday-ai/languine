import { writeFile } from "node:fs/promises";
import { defaultTranslations } from "fumadocs-ui/i18n";
import { defineConfig } from "languine";
import { i18n } from "./lib/i18n";

// translate Fumadocs' UI content
await writeFile(
  "content/ui.json",
  JSON.stringify(defaultTranslations, null, 2),
);

export default defineConfig({
  locale: {
    source: i18n.defaultLanguage,
    targets: i18n.languages.filter((v) => v !== i18n.defaultLanguage),
  },
  files: {
    json: {
      include: ["content/ui.[locale].json"],
    },
    md: {
      include: ["content/docs/**/*.mdx"],
    },
  },
});
