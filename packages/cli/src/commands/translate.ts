import fs from "node:fs/promises";
import path from "node:path";
import { type OpenAIProvider, createOpenAI } from "@ai-sdk/openai";
import { intro, outro, spinner } from "@clack/prompts";
import type { LanguageModel } from "ai";
import chalk from "chalk";
import { type OllamaProvider, createOllama } from "ollama-ai-provider";
import { simpleGit } from "simple-git";
import { getTranslator } from "../translators/index.js";
import type {
  Config,
  PromptOptions,
  Provider,
  UpdateResult,
} from "../types.js";
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

  const { targets } = config.locale;
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

  const model = await getModel(config);

  const s = spinner();
  s.start("Checking for changes and translating to target locales...");

  // Create translation tasks for all locales and file patterns
  const translationTasks = locales.flatMap((locale) =>
    Object.entries(config.files).flatMap(([format, { include }]) =>
      include.map(async (pattern) => {
        let sourcePath: string;
        let targetPath: string;

        if (typeof pattern === "string") {
          sourcePath = pattern.replace("[locale]", config.locale.source);
          targetPath = pattern.replace("[locale]", locale);
        } else {
          sourcePath = pattern.from;
          targetPath =
            typeof pattern.to === "string"
              ? pattern.to.replace("[locale]", locale)
              : pattern.to(locale);
        }

        try {
          return run(
            sourcePath,
            targetPath,
            config,
            format,
            locale,
            force,
            model,
          );
        } catch (error) {
          return {
            locale,
            sourcePath,
            success: false,
            error,
          } as RunResult;
        }
      }),
    ),
  );

  // Execute all translation tasks in parallel
  const results = await Promise.all(translationTasks);

  // Process results
  const failures = results.filter((r) => !r.success);
  const changes = results.filter((r) => r.success && !r.noChanges);

  s.stop("Translation completed");

  if (changes.length > 0) {
    for (const result of changes) {
      if (!result.success) continue;

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

const git = simpleGit();

type RunResult =
  | {
      locale: string;
      sourcePath: string;
      success: true;
      noChanges: boolean;
      summary?: string;
    }
  | {
      locale: string;
      sourcePath: string;
      success: false;
      error: unknown;
    };

async function run(
  sourcePath: string,
  targetPath: string,
  config: Config,
  format: string,
  targetLocale: string,
  force: boolean,
  model: LanguageModel,
): Promise<RunResult> {
  // Read source and target files
  const sourceContent = await fs.readFile(
    path.join(process.cwd(), sourcePath),
    "utf-8",
  );

  let previousContent = "";

  if (!force) {
    previousContent = await git.show(sourcePath).catch(() => "");

    if (previousContent === sourceContent)
      return {
        locale: targetLocale,
        sourcePath,
        success: true,
        noChanges: true,
      };
  }

  let previousTranslation = undefined;
  try {
    previousTranslation = await fs.readFile(
      path.join(process.cwd(), targetPath),
      "utf-8",
    );
  } catch (error) {
    // Create target file if it doesn't exist
    const targetDir = path.dirname(path.join(process.cwd(), targetPath));
    await fs.mkdir(targetDir, { recursive: true });
  }

  const adapter = await getTranslator(format);
  if (!adapter) {
    throw new Error(`No available translator for format: ${format}`);
  }

  const options: PromptOptions = {
    config,
    contentLocale: config.locale.source,
    format,
    model,
    targetLocale,
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
    locale: targetLocale,
    sourcePath,
    success: true,
    noChanges: false,
    summary,
  };
}
