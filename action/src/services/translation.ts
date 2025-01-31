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

  async runTranslation(config: Config) {
    try {
      const { apiKey, projectId, cliVersion, workingDirectory } = config;

      const cliCommand = this.#getCliCommand(cliVersion);

      logger.debug(`CLI Command: bunx ${cliCommand}`);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);
      logger.debug(`Working Directory: ${process.cwd()}`);

      // Change to working directory if specified
      const cwd = workingDirectory
        ? path.resolve(process.cwd(), workingDirectory)
        : process.cwd();

      const result = spawnSync(
        "bunx",
        [
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
