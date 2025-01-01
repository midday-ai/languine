import FastGlob from "fast-glob";
import { defineConfig } from "languine";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultTranslations } from "fumadocs-ui/i18n";
import { i18n } from "./lib/i18n";

// translate Fumadocs' UI content
await writeFile(
  "content/ui.json",
  JSON.stringify(defaultTranslations, null, 2),
);

export default defineConfig({
  llm: {
    provider: "openai",
    model: "gpt-4-turbo",
    temperature: 0,
  },
  version: "1.0.0",
  locale: {
    source: i18n.defaultLanguage,
    targets: i18n.languages.filter((v) => v !== i18n.defaultLanguage),
  },
  files: {
    json: {
      include: [
        {
          from: "content/ui.json",
          to: "content/ui.[locale].json",
        },
      ],
    },
    md: {
      include: (await FastGlob("content/docs/**/*.mdx"))
        .filter((file) => {
          // ignore translated content
          return path.basename(file).split(".").length === 2;
        })
        .map((file) => ({
          from: file,
          to(locale) {
            const { dir, name, ext } = path.parse(file);

            return path.join(dir, `${name}.${locale}${ext}`);
          },
        })),
    },
  },
});
