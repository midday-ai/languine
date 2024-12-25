import fs from "node:fs/promises";
import path from "node:path";
import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { intro, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import { type OllamaProvider, createOllama } from "ollama-ai-provider";
import { simpleGit } from "simple-git";
import { getTranslator } from "../translators/index.js";
import type { PromptOptions, UpdateResult } from "../types.js";
import type { Config, Provider } from "../types.js";
import { getApiKey, getConfig } from "../utils.js";

const providersMap: Record<
  Provider,
  () => Promise<OpenAIProvider | OllamaProvider>
> = {
  openai: async () =>
    createOpenAI({
      apiKey: await getApiKey("OpenAI", "OPENAI_API_KEY"),
    }),
  ollama: async () => createOllama(),
};

async function getModel(config: Config) {
  const provider = await providersMap[config.llm.provider]();

  return provider(config.llm.model);
}

export async function translate(targetLocale?: string, force = false) {
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

  const git = simpleGit();

  const model = await getModel(config);

  const s = spinner();
  s.start("Checking for changes and translating to target locales...");

  // Create translation tasks for all locales and file patterns
  const translationTasks = locales.flatMap((locale) =>
    Object.entries(config.files).flatMap(([format, { include }]) =>
      include.map(async (pattern) => {
        const sourcePath = pattern.replace("[locale]", source);
        const targetPath = pattern.replace("[locale]", locale);

        try {
          // Read source and target files
          const sourceContent = await fs.readFile(
            path.join(process.cwd(), sourcePath),
            "utf-8",
          );

          let previousContent = "";

          if (!force) {
            previousContent = await git.show(sourcePath).catch(() => "");

            if (previousContent === sourceContent)
              return { locale, sourcePath, success: true, noChanges: true };
          }

          let previousTranslation = undefined;
          try {
            previousTranslation = await fs.readFile(
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

          const adapter = await getTranslator(format);
          if (!adapter) {
            throw new Error(`No available translator for format: ${format}`);
          }

          const options: PromptOptions = {
            config,
            contentLocale: source,
            format,
            model,
            targetLocale: locale,
            content: sourceContent,
          };

          let { content: finalContent, summary } =
            previousTranslation && previousContent && !force
              ? await adapter.onUpdate({
                  ...options,
                  previousTranslation,
                  previousContent,
                })
              : ((await adapter.onNew(options)) as UpdateResult);

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
            summary,
          };
        } catch (error) {
          return {
            locale,
            sourcePath,
            success: false,
            error,
          };
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
          `✓ Translated ${result.summary ?? "content"} for ${result.locale}`,
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
