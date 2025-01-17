import { readFile, writeFile } from "node:fs/promises";
import { type ParserType, createParser } from "@/parsers/index.js";
import type { Config } from "@/types.js";
import { client } from "@/utils/api.js";
import { outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import glob from "fast-glob";
import { loadConfig } from "../utils/config.js";

// Map our parser types to the API's source format types
const sourceFormatMap = {
  json: "json",
  javascript: "json",
  typescript: "json",
} as const;

export async function translateCommand() {
  const s = spinner();

  try {
    // Load config file
    const config = await loadConfig();

    if (!config) {
      throw new Error(
        "No config file found. Run `languine init` to create one.",
      );
    }

    const { source: sourceLocale, targets: targetLocales } = config.locale;

    // Process each file configuration
    for (const [type, fileConfig] of Object.entries(config.files)) {
      const parserType = type as ParserType;
      const { include } = fileConfig as Config["files"][string];

      // Process each file pattern
      for (const pattern of include) {
        const globPattern =
          typeof pattern === "string" ? pattern : pattern.glob;
        const sourcePattern = globPattern.replace("[locale]", sourceLocale);

        // Find all matching source files
        const sourceFiles = await glob(sourcePattern, { absolute: true });

        for (const sourceFilePath of sourceFiles) {
          const parser = createParser({
            type: parserType,
          });

          // Read and parse the source file
          const sourceFile = await readFile(sourceFilePath, "utf-8");
          const sourceContent = await parser.parse(sourceFile);

          // Translate to each target locale
          for (const targetLocale of targetLocales) {
            try {
              // Convert the content to the expected format
              const translationInput = Object.entries(sourceContent).map(
                ([key, sourceText]) => ({
                  key,
                  sourceText: String(sourceText),
                }),
              );

              console.log(translationInput);

              return;

              // Call the translation API with the mapped source format
              const translations =
                await client.translate.pushTranslations.mutate({
                  sourceFormat: sourceFormatMap[parserType],
                  sourceLanguage: sourceLocale,
                  targetLanguage: targetLocale,
                  content: translationInput,
                  projectId: "default", // TODO: Add project ID support
                });

              // Convert the translations back to the expected format
              const translatedContent = Object.fromEntries(
                translationInput.map((item, index) => [
                  item.key,
                  translations[index],
                ]),
              );

              // Serialize the translated content
              const targetPath = sourceFilePath.replace(
                sourceLocale,
                targetLocale,
              );
              const serialized = await parser.serialize(
                translatedContent,
                targetLocale,
              );
              await writeFile(targetPath, serialized, "utf-8");

              console.log(
                chalk.green(
                  `✓ Successfully translated to ${chalk.bold(targetLocale)}`,
                ),
              );
            } catch (error) {
              const translationError = error as Error;
              console.error(
                chalk.red(
                  `Failed to translate to ${chalk.bold(
                    targetLocale,
                  )}: ${translationError.message}`,
                ),
              );
            }
          }
        }
      }
    }

    s.stop("Translation completed");
    outro("All translations completed");
  } catch (error) {
    const translationError = error as Error;
    s.stop(chalk.red(`Translation failed: ${translationError.message}`));
    process.exit(1);
  }
}
