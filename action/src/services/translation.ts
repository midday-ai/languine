import { spawnSync } from "node:child_process";
import path from "node:path";
import type { Config } from "../utils/config.ts";
import { logger } from "../utils/logger.ts";

interface ExecError extends Error {
  stderr?: string;
}

export class TranslationService {
  #getCliCommand(cliVersion = "latest") {
    return `languine@${cliVersion}`;
  }

  #findBunPath(): string {
    const result = spawnSync("which", ["bun"], { encoding: "utf8" });
    if (result.error || result.status !== 0) {
      logger.error("Failed to find bun executable");
      throw new Error("Could not find bun executable");
    }
    return result.stdout.trim();
  }

  async runTranslation(config: Config) {
    try {
      const { apiKey, projectId, cliVersion, workingDirectory } = config;

      const cliCommand = this.#getCliCommand(cliVersion);
      const bunPath = this.#findBunPath();

      logger.debug(`Bun path: ${bunPath}`);
      logger.debug(`CLI Command: bun x ${cliCommand}`);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);
      logger.debug(`Working Directory: ${process.cwd()}`);

      // Change to working directory if specified
      const cwd = workingDirectory
        ? path.resolve(process.cwd(), workingDirectory)
        : process.cwd();

      const result = spawnSync(
        bunPath,
        [
          "x",
          cliCommand,
          "translate",
          "--project-id",
          projectId,
          "--api-key",
          apiKey,
        ],
        {
          cwd,
          stdio: "inherit",
        },
      );

      if (result.error) {
        throw result.error;
      }

      if (result.status !== 0) {
        throw new Error(`Command failed with exit code ${result.status}`);
      }
    } catch (error) {
      logger.error(`Translation process failed: ${error}`);
      throw error;
    }
  }
}
