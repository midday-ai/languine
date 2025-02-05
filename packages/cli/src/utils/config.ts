import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Config } from "@/types.js";
import { outro } from "@clack/prompts";
import chalk from "chalk";
import type { Jiti } from "jiti";
import { loadEnv } from "./env.js";

const CONFIG_NAME = "languine.config";
const VALID_EXTENSIONS = [".ts", ".mjs", ".json"] as const;
type ConfigFormat = (typeof VALID_EXTENSIONS)[number];

export async function configFile(configType?: string) {
  const workingDir = process.cwd();
  const files = await readdir(workingDir);
  const configFile = files.find(
    (file: string) =>
      file.startsWith(`${CONFIG_NAME}.`) &&
      VALID_EXTENSIONS.some((ext) => file.endsWith(ext)),
  );

  // If configType is specified, use that
  // Otherwise try to detect from existing file, falling back to ts
  let format: ConfigFormat;
  if (configType) {
    format = `.${configType}` as ConfigFormat;
  } else if (configFile) {
    format = VALID_EXTENSIONS.find((ext) => configFile.endsWith(ext)) || ".ts";
  } else {
    format = ".ts";
  }

  const filePath = resolve(workingDir, configFile || `${CONFIG_NAME}${format}`);

  return {
    path: filePath,
    format,
  };
}

/**
 * Load the configuration file from the current working directory.
 * Supports TypeScript (.ts), JavaScript (.mjs), and JSON (.json) formats.
 */
export async function loadConfig(): Promise<Config> {
  let jiti: Jiti | undefined;
  const workingDir = process.cwd();

  const { path: filePath, format } = await configFile();
  const env = loadEnv(workingDir);

  if (!filePath) {
    outro(
      chalk.red(
        `Could not find ${CONFIG_NAME}${format}. Run 'languine init' first.`,
      ),
    );

    process.exit(1);
  }

  try {
    // For TypeScript files, use jiti for proper resolution from the working directory
    if (format === ".ts") {
      const { createJiti } = await import("jiti");
      const { transform } = await import("sucrase");

      jiti = createJiti(workingDir, {
        transform(opts) {
          return transform(opts.source, {
            transforms: ["typescript", "imports"],
          });
        },
      });

      const config = await jiti
        .import(filePath)
        .then((mod) => (mod as unknown as { default: Config }).default);

      return {
        ...config,
        projectId: config.projectId || env.LANGUINE_PROJECT_ID,
      };
    }

    // For JSON files, read and parse the file
    if (format === ".json") {
      const content = await readFile(filePath, "utf-8");
      const config = JSON.parse(content) as Config;

      return {
        ...config,
        projectId: config.projectId || env.LANGUINE_PROJECT_ID,
      };
    }

    // For MJS files, use standard import
    const configModule = await import(pathToFileURL(filePath).href);
    const config = configModule.default;

    return {
      ...config,
      projectId: config.projectId || env.LANGUINE_PROJECT_ID,
    };
  } catch {
    outro(chalk.red("Error loading config"));
    process.exit(1);
  }
}
