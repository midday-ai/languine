import { readFile, writeFile } from "node:fs/promises";
import { createParser } from "@/parsers/index.ts";
import type { Config } from "@/types.js";
import { client } from "@/utils/api.ts";
import { configFile, loadConfig } from "@/utils/config.ts";
import { LockFileManager } from "@/utils/lock.ts";
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
    let shouldRemoveKeys = false;

    // Get config file path and initialize lock file manager
    const { path: configPath } = await configFile();
    const lockManager = new LockFileManager(configPath);

    // Keep track of all source files and their content
    const allSourceFiles = new Map<string, Record<string, string>>();

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

          // Read source file content
          const sourceContent = await readFile(sourceFilePath, "utf-8");
          const parsedSourceContent = await parser.parse(sourceContent);

          // Store source content for later
          allSourceFiles.set(sourceFilePath, parsedSourceContent);

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

                // Find keys that exist in target but not in source
                const removedKeys = Object.keys(existingContent).filter(
                  (key) => !(key in parsedSourceContent),
                );

                if (removedKeys.length > 0) {
                  needsUpdates = true;
                  if (checkOnly) {
                    console.log(
                      chalk.yellow(
                        `Found ${removedKeys.length} deleted keys in ${targetPath}`,
                      ),
                    );
                    continue;
                  }

                  // Ask for confirmation only once
                  if (!shouldRemoveKeys) {
                    s.stop();
                    note(
                      "Detected keys that have been removed from source files.\nThis will remove these keys from all target locale files and from Languine.",
                      "Remove keys",
                    );

                    shouldRemoveKeys = (await confirm({
                      message: "Do you want to continue?",
                    })) as boolean;
                    s.start();

                    if (!shouldRemoveKeys) {
                      s.message("Skipping deletion of keys...");
                      return;
                    }

                    // Delete keys from platform after confirmation
                    s.message("Deleting keys from Languine...");
                    const data = await client.translate.deleteKeys.mutate({
                      projectId: config.projectId,
                      keys: removedKeys,
                    });

                    if (!data) {
                      s.stop();
                      console.error(
                        chalk.red("Failed to delete keys from Languine"),
                      );
                      return;
                    }
                    s.message(chalk.green("Keys deleted from Languine"));
                  }

                  // Remove keys from target file
                  const updatedContent = { ...existingContent };
                  let hasRemovedKeys = false;

                  for (const key of removedKeys) {
                    if (key in updatedContent) {
                      delete updatedContent[key];
                      hasRemovedKeys = true;
                    }
                  }

                  if (hasRemovedKeys) {
                    try {
                      const serialized = await parser.serialize(
                        targetLocale,
                        updatedContent,
                        existingFile,
                      );

                      // Run beforeSaving hook if configured
                      let finalContent = serialized;
                      if (config?.hooks?.beforeSaving) {
                        finalContent = await config.hooks.beforeSaving({
                          content: serialized,
                          filePath: targetPath,
                          locale: targetLocale,
                          format: type,
                        });
                      }

                      await writeFile(targetPath, finalContent, "utf-8");
                      syncedAnything = true;
                    } catch (serializeError) {
                      console.error(
                        chalk.red(
                          `Failed to serialize ${targetPath}: ${serializeError instanceof Error ? serializeError.message : String(serializeError)}`,
                        ),
                      );
                    }
                  }
                }
              } catch {}
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

    // Update lock file with all source content after processing everything
    if (syncedAnything) {
      lockManager.syncSourceFiles(allSourceFiles);
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
    console.error(chalk.red(`Sync process failed: ${syncError.message}`));
    process.exit(1);
  }
}
