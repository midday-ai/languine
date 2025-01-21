import { readFile, writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createParser } from "@/parsers/index.ts";
import type { Config } from "@/types.js";
import { client } from "@/utils/api.js";
import { loadConfig } from "@/utils/config.ts";
import { getDiff } from "@/utils/diff.js";
import { loadEnv } from "@/utils/env.ts";
import { getGitInfo } from "@/utils/git.ts";
import { getAPIKey } from "@/utils/session.ts";
import { confirm, note, outro, select, spinner } from "@clack/prompts";
import { auth, runs } from "@trigger.dev/sdk/v3";
import chalk from "chalk";
import glob from "fast-glob";
import open from "open";
import { z } from "zod";

const { BASE_URL } = loadEnv();

const argsSchema = z.array(z.string()).transform((args) => {
  const forceIndex = args.indexOf("--force");

  return {
    forceTranslate: forceIndex !== -1,
    isSilent: args.includes("--silent"),
    checkOnly: args.includes("--check"),
    forcedLocales:
      forceIndex !== -1 &&
      args.length > forceIndex + 1 &&
      !args[forceIndex + 1].startsWith("--")
        ? args[forceIndex + 1].split(",")
        : [],
  };
});

type TranslationResult = {
  translations: Record<string, Array<{ key: string; translatedText: string }>>;
};

export async function translateCommand(args: string[] = []) {
  const { forceTranslate, isSilent, checkOnly, forcedLocales } =
    argsSchema.parse(args);
  const s = spinner();

  const apiKey = getAPIKey();
  const gitInfo = await getGitInfo();

  if (!apiKey) {
    throw new Error("No API key found. Please run `languine login` first.");
  }

  if (!isSilent) {
    s.start(checkOnly ? "Checking translations..." : "Translating...");
  }

  try {
    // Load config file
    const config = await loadConfig();

    if (!config) {
      note(
        "Configuration file not found. Please run `languine init` to create one.",
      );

      process.exit(1);
    }

    const projectId = config.projectId || process.env.LANGUINE_PROJECT_ID;

    if (!projectId) {
      note(
        "Project ID not found in configuration file or LANGUINE_PROJECT_ID environment variable. Please run `languine init` to create one, set the `projectId` in your configuration file, or set the LANGUINE_PROJECT_ID environment variable.",
        "Error",
      );

      process.exit(1);
    }

    const { source: sourceLocale, targets: targetLocales } = config.locale;

    // Filter target locales if specific ones are forced
    const effectiveTargetLocales =
      forcedLocales.length > 0
        ? targetLocales.filter((locale) => forcedLocales.includes(locale))
        : targetLocales;

    if (forcedLocales.length > 0) {
      const invalidLocales = forcedLocales.filter(
        (locale) => !targetLocales.includes(locale),
      );
      if (invalidLocales.length > 0) {
        throw new Error(`Invalid target locales: ${invalidLocales.join(", ")}`);
      }
    }

    let translatedAnything = false;
    let needsUpdates = false;

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

          let keysToTranslate: string[];
          let removedKeys: string[] = [];

          if (forceTranslate) {
            // If force flag is used, translate all keys
            keysToTranslate = Object.keys(sourceContent);
          } else {
            // Otherwise use normal diff detection
            try {
              const changes = await getDiff({ sourceFilePath, type });
              keysToTranslate = [...changes.addedKeys, ...changes.changedKeys];
              removedKeys = changes.removedKeys;
            } catch (error) {
              console.log();
              note(
                "Please commit your files before continuing. This command needs to compare against the previous version in git.\nNeed help? https://languine.ai/docs/getting-started/troubleshooting",
                "Diff Error",
              );
              console.log();
              process.exit(1);
            }
          }

          if (keysToTranslate.length > 0 || removedKeys.length > 0) {
            needsUpdates = true;
            if (checkOnly) {
              if (!isSilent) {
                if (keysToTranslate.length > 0) {
                  console.log(
                    chalk.yellow(
                      `  Keys to translate: ${keysToTranslate.length}`,
                    ),
                  );
                }
                if (removedKeys.length > 0) {
                  console.log(
                    chalk.yellow(`  Keys to remove: ${removedKeys.length}`),
                  );
                }
              }

              continue;
            }
          }

          if (checkOnly) continue;

          // Convert the content to the expected format
          const translationInput = Object.entries(sourceContent)
            .filter(([key]) => keysToTranslate.includes(key))
            .map(([key, sourceText]) => ({
              key,
              sourceText: sourceText,
              documentName: sourceFilePath.split("/").pop(),
            }));

          let shouldRemoveKeys = false;
          if (!forceTranslate && removedKeys.length > 0) {
            s.stop();
            shouldRemoveKeys = (await confirm({
              message: `${removedKeys.length} keys were removed from the source file. Do you want to remove them from target files as well?`,
            })) as boolean;
            s.start();
          }

          if (translationInput.length === 0 && !shouldRemoveKeys) {
            if (!isSilent) {
              s.message(
                `No ${forceTranslate ? "" : "changes"} detected in ${sourceFilePath}, skipping...`,
              );
            }
            continue;
          }

          let result: TranslationResult;

          const { error, run, meta } = await client.jobs.startJob.mutate({
            apiKey: apiKey,
            projectId,
            sourceFormat: type,
            sourceLanguage: sourceLocale,
            targetLanguages: effectiveTargetLocales,
            content: translationInput,
            branch: gitInfo?.branchName,
            commit: gitInfo?.commitHash,
            sourceProvider: gitInfo?.provider,
            commitMessage: gitInfo?.commitMessage,
            commitLink: gitInfo?.commitLink,
          });

          if (
            error?.code === "DOCUMENT_LIMIT_REACHED" ||
            error?.code === "KEY_LIMIT_REACHED"
          ) {
            s.stop();

            if (error?.code === "DOCUMENT_LIMIT_REACHED") {
              note(
                "Document limit reached. Upgrade your plan to increase your limit.",
                "Limit reached",
              );
            } else {
              note(
                "Translation keys limit reached. Upgrade your plan to increase your limit.",
                "Limit reached",
              );
            }

            const shouldUpgrade = await select({
              message: "Would you like to upgrade your plan now?",
              options: [
                { label: "Upgrade plan", value: "upgrade" },
                { label: "Cancel", value: "cancel" },
              ],
            });

            if (shouldUpgrade === "upgrade") {
              // Open upgrade URL in browser
              if (meta?.plan === "free") {
                await open(
                  `${BASE_URL}/${meta?.organizationId}/default/settings?tab=billing&referrer=cli`,
                );
              } else {
                s.start("Upgrading plan...");

                // Just upgrade the plan
                await client.organization.updatePlan.mutate({
                  organizationId: meta?.organizationId,
                  tier: meta?.tier + 1,
                });

                s.stop(chalk.green("Plan upgraded successfully"));

                note(
                  "Run `languine translate` again to continue.",
                  "What's next?",
                );
              }
            }

            process.exit(1);
          }

          if (!run) {
            s.stop();
            note("Translation job not found", "Error");
            process.exit(1);
          }

          // If in queue, show a pro tip
          if (!isSilent && meta?.plan === "free") {
            if (!checkOnly) {
              note(
                "Upgrade to Pro for faster translations https://languine.ai/pricing",
                "Pro tip",
              );
            }
          }

          await auth.withAuth(
            { accessToken: run.publicAccessToken },
            async () => {
              for await (const update of runs.subscribeToRun(run.id)) {
                if (update.metadata?.progress && !isSilent) {
                  s.message(
                    `Translation progress: ${Math.round(
                      Number(update.metadata.progress),
                    )}%`,
                  );
                }
                if (update.finishedAt) {
                  result = update.output;
                  break;
                }
              }
            },
          );

          if (!isSilent) {
            s.message("Processing translations...");
          }

          // Process results for each target locale
          for (const targetLocale of effectiveTargetLocales) {
            try {
              const targetPath = sourceFilePath.replace(
                sourceLocale,
                targetLocale,
              );

              // Create directory if it doesn't exist
              await mkdir(dirname(targetPath), { recursive: true });

              // Read existing target file if it exists
              let existingContent: Record<string, string> = {};
              let originalFileContent: string | undefined;
              try {
                const existingFile = await readFile(targetPath, "utf-8");
                originalFileContent = existingFile;
                existingContent = await parser.parse(existingFile);
              } catch (error) {
                // File doesn't exist yet, use empty object
              }

              // Remove deleted keys if user confirmed
              if (shouldRemoveKeys) {
                for (const key of removedKeys) {
                  delete existingContent[key];
                }
              }

              // Convert the translations and merge with existing content
              const translatedContent = Object.fromEntries(
                translationInput.map((item, index) => [
                  item.key,
                  result.translations[targetLocale][index].translatedText,
                ]),
              );

              const mergedContent = {
                ...existingContent,
                ...translatedContent,
              };

              // Pass the original file content as a string if it exists
              const serialized = await parser.serialize(
                targetLocale,
                mergedContent,
                originalFileContent,
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

              if (translationInput.length > 0) {
                translatedAnything = true;
              }
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

    if (!isSilent) {
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
        if (translatedAnything) {
          outro("All translations completed successfully!");
        }
      }
    }
    process.exit(checkOnly && needsUpdates ? 1 : 0);
  } catch (error) {
    const translationError = error as Error;

    if (!isSilent) {
      console.log(
        chalk.red(`Translation process failed: ${translationError.message}`),
      );
    }
    process.exit(1);
  }
}
