import { readFile, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createParser } from "@/parsers/index.ts";
import type { Config } from "@/types.js";
import { client } from "@/utils/api.js";
import { loadConfig } from "@/utils/config.ts";
import { getDiff } from "@/utils/diff.js";
import { note, outro, spinner } from "@clack/prompts";
import type { translateTask } from "@jobs/translate/translate.ts";
import { runs, tasks } from "@trigger.dev/sdk/v3";
import chalk from "chalk";
import glob from "fast-glob";

export async function translateCommand() {
  const s = spinner();

  note(
    "Upgrade to Pro for priority queue access at https://languine.ai/pricing",
    "Pro tip",
  );

  // intro(chalk.yellow("Waiting in translation queue..."));

  s.start("Translating...");

  try {
    // Load config file
    const config = await loadConfig();

    if (!config) {
      throw new Error(
        "Configuration file not found. Please run `languine init` to create one.",
      );
    }

    const publicToken = await client.jobs.createPublicToken.mutate();

    const { source: sourceLocale, targets: targetLocales } = config.locale;

    // Process each file configuration
    for (const [type, fileConfig] of Object.entries(config.files)) {
      const { include } = fileConfig as Config["files"][string];

      // Process each file pattern
      for (const pattern of include) {
        const globPattern =
          pattern && typeof pattern === "object" ? pattern.glob : pattern;
        const sourcePattern = globPattern.replace("[locale]", sourceLocale);

        // Find all matching source files
        const sourceFiles = await glob(sourcePattern, { absolute: true });

        for (const sourceFilePath of sourceFiles) {
          const parser = createParser({ type });

          // Read and parse the source file
          const sourceFile = await readFile(sourceFilePath, "utf-8");
          const sourceContent = await parser.parse(sourceFile);

          // Detect changes in source file
          const changes = await getDiff({ sourceFilePath, type });

          // Only translate added and changed keys
          const keysToTranslate = [
            ...changes.addedKeys,
            ...changes.changedKeys,
          ];

          // Convert the content to the expected format, filtering for changed keys
          const translationInput = Object.entries(sourceContent)
            .filter(([key]) => keysToTranslate.includes(key))
            .map(([key, sourceText]) => ({
              key,
              sourceText: String(sourceText),
            }));

          if (translationInput.length === 0) {
            s.message(`No changes detected in ${sourceFilePath}, skipping...`);
            continue;
          }

          // Send one request for all target languages and poll for completion
          const run = await tasks.trigger("translate", {
            apiKey: publicToken,
            projectId: config.projectId,
            sourceFormat: type,
            sourceLanguage: sourceLocale,
            targetLanguages: targetLocales,
            content: translationInput,
          });

          let result: typeof translateTask;

          for await (const update of runs.subscribeToRun<typeof translateTask>(
            run.id,
          )) {
            if (update.metadata?.progress) {
              s.message(
                `Translation progress: ${Math.round(
                  Number(update.metadata.progress) * 100,
                )}%`,
              );
            }
            if (update.finishedAt) {
              result = {
                status: update.status,
                output: update.output,
              };

              break;
            }
          }

          s.message("Processing translations...");

          // Process results for each target locale
          for (const targetLocale of targetLocales) {
            try {
              // Convert the translations back to the expected format
              const translatedContent = Object.fromEntries(
                translationInput.map((item, index) => [
                  item.key,
                  result.output.translations[targetLocale][index]
                    .translatedText,
                ]),
              );

              // Serialize the translated content
              const targetPath = sourceFilePath.replace(
                sourceLocale,
                targetLocale,
              );

              // Create directory if it doesn't exist
              await mkdir(dirname(targetPath), { recursive: true });

              const serialized = await parser.serialize(translatedContent);
              await writeFile(targetPath, serialized, "utf-8");
            } catch (error) {
              const translationError = error as Error;
              console.error(
                chalk.red(
                  `Translation failed for ${chalk.bold(
                    targetLocale,
                  )}: ${translationError.message}`,
                ),
              );
            }
          }
        }
      }
    }

    s.stop("Completed");
    outro("All translations completed successfully!");
    process.exit(0);
  } catch (error) {
    const translationError = error as Error;

    console.log(
      chalk.red(`Translation process failed: ${translationError.message}`),
    );
    process.exit(1);
  }
}
