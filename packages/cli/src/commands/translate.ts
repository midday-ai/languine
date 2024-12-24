import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { intro, outro, spinner } from "@clack/prompts";
import { generateText } from "ai";
import chalk from "chalk";
import dedent from "dedent";
import { type OllamaProvider, createOllama } from "ollama-ai-provider";
import { prompt as defaultPrompt } from "../prompt.js";
import type { Config, Provider } from "../types.js";
import { extractChangedKeys, getApiKey, getConfig } from "../utils.js";

const providersMap: Record<Provider, OpenAIProvider | OllamaProvider> = {
  openai: createOpenAI({
    apiKey: await getApiKey("OpenAI", "OPENAI_API_KEY"),
  }),
  ollama: createOllama(),
};

function getModel(config: Config) {
  const provider = providersMap[config.llm.provider];

  return provider(config.llm.model);
}

export async function translate(targetLocale?: string, force?: boolean) {
  intro("Starting translation process...");

  const config = await getConfig();

  const { source, targets } = config.locale;
  const locales = targetLocale ? [targetLocale] : targets;

  // Validate target locale if specified
  if (targetLocale && !targets.includes(targetLocale)) {
    outro(
      chalk.red(
        `Invalid target locale: ${targetLocale}. Available locales: ${targets.join(", ")}`,
      ),
    );
    process.exit(1);
  }

  const model = getModel(config);

  const s = spinner();
  s.start("Checking for changes and translating to target locales...");

  // Create translation tasks for all locales and file patterns
  const translationTasks = locales.flatMap((locale) =>
    Object.entries(config.files).flatMap(([format, { include }]) =>
      include.map(async (pattern) => {
        const sourcePath = pattern.replace("[locale]", source);
        const targetPath = pattern.replace("[locale]", locale);

        try {
          let addedKeys: string[] = [];

          if (!force) {
            // Get git diff for source file if not force translating
            const diff = execSync(`git diff HEAD -- ${sourcePath}`, {
              encoding: "utf-8",
            });

            if (!diff) {
              return { locale, sourcePath, success: true, noChanges: true };
            }

            const changes = extractChangedKeys(diff);
            addedKeys = changes.addedKeys;

            if (addedKeys.length === 0) {
              return { locale, sourcePath, success: true, noChanges: true };
            }
          }

          // Read source and target files
          const sourceContent = await fs.readFile(
            path.join(process.cwd(), sourcePath),
            "utf-8",
          );

          let targetContent = "";
          try {
            targetContent = await fs.readFile(
              path.join(process.cwd(), targetPath),
              "utf-8",
            );
          } catch (error) {
            // Create target file if it doesn't exist
            const targetDir = path.dirname(
              path.join(process.cwd(), targetPath),
            );
            await fs.mkdir(targetDir, { recursive: true });
          }

          // Parse source content
          const sourceObj =
            format === "ts"
              ? Function(
                  `return ${sourceContent.replace(/export default |as const;/g, "")}`,
                )()
              : JSON.parse(sourceContent);

          // If force is true, translate everything. Otherwise only new keys
          const keysToTranslate = force ? Object.keys(sourceObj) : addedKeys;
          const contentToTranslate: Record<string, string> = {};
          for (const key of keysToTranslate) {
            contentToTranslate[key] = sourceObj[key];
          }

          const prompt = dedent`
            You are a professional translator working with ${format.toUpperCase()} files.
            
            Task: Translate the content below from ${source} to ${locale}.
            ${force ? "" : "Only translate the new keys provided."}

            ${defaultPrompt}

            ${config.instructions ?? ""}

            Source content ${force ? "" : "(new keys only)"}:
            ${JSON.stringify(contentToTranslate, null, 2)}

            Return only the translated content with identical structure in ${format.toUpperCase()} format, nothing else.
          `;

          // Get translation from model
          const { text } = await generateText({
            model,
            prompt,
          });

          // Parse the translated content
          const translatedObj =
            format === "ts"
              ? Function(`return ${text.replace(/as const;?/g, "")}`)()
              : JSON.parse(text);

          // Merge with existing translations if not force translating
          const finalObj = force
            ? translatedObj
            : {
                ...(targetContent
                  ? format === "ts"
                    ? Function(
                        `return ${targetContent.replace(/export default |as const;/g, "")}`,
                      )()
                    : JSON.parse(targetContent)
                  : {}),
                ...translatedObj,
              };

          // Format the final content
          let finalContent =
            format === "ts"
              ? `export default ${JSON.stringify(finalObj, null, 2)} as const;\n`
              : JSON.stringify(finalObj, null, 2);

          // Run afterTranslate hook if defined
          if (config.hooks?.afterTranslate) {
            finalContent = await config.hooks.afterTranslate({
              content: finalContent,
              filePath: targetPath,
            });
          }

          // Write translated content
          await fs.writeFile(
            path.join(process.cwd(), targetPath),
            finalContent,
            "utf-8",
          );

          return {
            locale,
            sourcePath,
            success: true,
            addedKeys: keysToTranslate,
          };
        } catch (error) {
          return { locale, sourcePath, success: false, error };
        }
      }),
    ),
  );

  // Execute all translation tasks in parallel
  const results = await Promise.all(translationTasks);

  // Process results
  const failures = results.filter((r) => !r.success);
  const changes = results.filter((r) => !r.noChanges && r.success);

  s.stop("Translation completed");

  if (changes.length > 0) {
    for (const result of changes) {
      console.log(
        chalk.green(
          `✓ Translated ${result.addedKeys?.length} ${force ? "total" : "new"} keys for ${result.locale}`,
        ),
      );
    }
  } else {
    console.log(chalk.yellow(`No ${force ? "" : "new "}keys to translate`));
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(
        chalk.red(
          `Error translating ${failure.sourcePath} to ${failure.locale}:`,
        ),
        failure.error,
      );
    }
  }

  outro(
    failures.length === 0
      ? chalk.green("All translations completed successfully!")
      : chalk.yellow(`Translation completed with ${failures.length} error(s)`),
  );
}
