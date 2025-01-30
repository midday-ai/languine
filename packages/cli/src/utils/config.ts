import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Config } from "@/types.js";
import { outro } from "@clack/prompts";
import chalk from "chalk";
import type { Jiti } from "jiti";
import { loadEnv } from "./env.js";

const CONFIG_NAME = "languine.config";

export async function configFile(configType?: string) {
  const workingDir = process.env.WORKING_DIRECTORY || process.cwd();
  const files = await readdir(workingDir);
  const configFile = files.find(
    (file: string) =>
      file.startsWith(`${CONFIG_NAME}.`) &&
      (file.endsWith(".ts") || file.endsWith(".mjs")),
  );

  // If configType is specified, use that
  // Otherwise try to detect from existing file, falling back to ts
  const format = configType || (configFile?.endsWith(".mjs") ? "mjs" : "ts");
  const filePath = resolve(
    workingDir,
    configFile || `${CONFIG_NAME}.${format}`,
  );

  return {
    path: filePath,
    format,
  };
}

/**
 * Load the configuration file from the working directory specified by WORKING_DIRECTORY env var.
 * Supports both TypeScript (languine.config.ts) and JSON (languine.config.json) formats.
 */
export async function loadConfig(): Promise<Config> {
  let jiti: Jiti | undefined;
  const workingDir = process.env.WORKING_DIRECTORY || process.cwd();

  const { path: filePath, format } = await configFile();
  const env = loadEnv(workingDir);

  if (!filePath) {
    outro(
      chalk.red(
        `Could not find ${CONFIG_NAME}.${format}. Run 'languine init' first.`,
      ),
    );

    process.exit(1);
  }

  try {
    // For TypeScript files, use jiti for proper resolution from the working directory
    if (format === "ts") {
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

      // Don't validate projectId here since it might be passed as an argument
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
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
}
