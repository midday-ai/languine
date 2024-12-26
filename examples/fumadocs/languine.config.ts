import fg from "fast-glob";
import path from "node:path";
import { defineConfig } from "languine";

export default defineConfig({
  version: "0.5.5",
  locale: {
    source: "en",
    targets: ["cn", "fr"],
  },
  files: {
    md: {
      include: (await fg("content/docs/**/*.md")).map((file) => {
        const { dir, name, ext } = path.parse(file);

        return {
          from: file,
          to: (locale) => path.join(dir, `${name}.${locale}${ext}`),
        };
      }),
    },
  },
  openai: {
    model: "gpt-4-turbo",
  },
});
