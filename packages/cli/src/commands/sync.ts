import { readFile, writeFile } from "node:fs/promises";
import { createParser } from "@/parsers/index.ts";
import type { Config } from "@/types.js";
import { client } from "@/utils/api.ts";
import { loadConfig } from "@/utils/config.ts";
import { getDiff } from "@/utils/diff.js";
import { confirm, note, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import glob from "fast-glob";
import { z } from "zod";

const argsSchema = z.array(z.string()).transform((args) => {
  return {
    checkOnly: args.includes("--check"),
  };
});

export async function syncCommand(args: string[] = []) {
  const { checkOnly } = argsSchema.parse(args);
  const s = spinner();

  s.start(
    checkOnly ? "Checking for deleted keys..." : "Syncing deleted keys...",
  );

  try {
    // Load config file
    const config = await loadConfig();

    if (!config) {
      throw new Error(
        "Configuration file not found. Please run `languine init` to create one.",
      );
    }

    if (!config.projectId) {
      throw new Error(
        "Project ID not found. Please run `languine init` to create one.",
      );
    }

    const { source: sourceLocale, targets: targetLocales } = config.locale;
    let needsUpdates = false;
    let syncedAnything = false;

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

          // Get diff to find deleted keys
          const changes = await getDiff({ sourceFilePath, type });
          const removedKeys = changes.removedKeys;

          if (removedKeys.length > 0) {
            needsUpdates = true;
            if (checkOnly) {
              console.log(
                chalk.yellow(
                  `Found ${removedKeys.length} deleted keys in ${sourceFilePath}`,
                ),
              );
              continue;
            }

            let shouldRemoveKeys = false;
            s.stop();
            note(
              `Detected ${removedKeys.length} keys removed.\nThis will remove these keys from all target locale files and from the platform.`,
              "Remove keys",
            );

            shouldRemoveKeys = (await confirm({
              message: "Do you want to continue?",
            })) as boolean;
            s.start();

            if (!shouldRemoveKeys) {
              s.message("Skipping deletion of keys...");
              continue;
            }

            // Remove keys from platform
            s.message("Deleting keys from platform...");

            const data = await client.translate.deleteKeys.mutate({
              projectId: config.projectId,
              keys: removedKeys,
            });

            if (data) {
              s.stop();
              s.message(chalk.green("Keys deleted from platform"));
            } else {
              s.stop();
              s.message(chalk.red("Failed to delete keys from platform"));
            }

            return;

            // Process each target locale
            for (const targetLocale of targetLocales) {
              try {
                const targetPath = sourceFilePath.replace(
                  sourceLocale,
                  targetLocale,
                );

                // Read existing target file
                try {
                  const existingFile = await readFile(targetPath, "utf-8");
                  const existingContent = await parser.parse(existingFile);

                  // Remove deleted keys
                  let hasRemovedKeys = false;
                  for (const key of removedKeys) {
                    if (key in existingContent) {
                      delete existingContent[key];
                      hasRemovedKeys = true;
                    }
                  }

                  if (hasRemovedKeys) {
                    const serialized = await parser.serialize(
                      targetLocale,
                      existingContent,
                      existingContent,
                    );

                    // Run afterTranslate hook if configured
                    let finalContent = serialized;
                    if (config?.hooks?.afterTranslate) {
                      finalContent = await config.hooks.afterTranslate({
                        content: serialized,
                        filePath: targetPath,
                      });
                    }

                    await writeFile(targetPath, finalContent, "utf-8");
                    syncedAnything = true;
                  }
                } catch (error) {
                  // Target file doesn't exist, skip it
                  console.log(
                    chalk.yellow(
                      `Target file ${targetPath} does not exist, skipping...`,
                    ),
                  );
                }
              } catch (error) {
                const syncError = error as Error;
                console.error(
                  chalk.red(
                    `Sync failed for ${chalk.bold(
                      targetLocale,
                    )}: ${syncError.message}`,
                  ),
                );
              }
            }
          }
        }
      }
    }

    if (checkOnly) {
      if (needsUpdates) {
        s.stop("Updates needed");
        process.exit(1);
      } else {
        s.stop("No updates needed");
        process.exit(0);
      }
    } else {
      s.stop("Completed");
      if (syncedAnything) {
        outro("All files synchronized successfully!");
      } else {
        outro("No files needed synchronization.");
      }
    }
    process.exit(checkOnly && needsUpdates ? 1 : 0);
  } catch (error) {
    const syncError = error as Error;
    console.log(chalk.red(`Sync process failed: ${syncError.message}`));
    process.exit(1);
  }
}
