import type { Config } from "../utils/config.ts";
import { runCommand } from "../utils/exec.ts";
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

      logger.debug(`CLI Command: bun x ${cliCommand}`);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);
      logger.debug(`Working Directory: ${process.cwd()}`);

      await runCommand([
        "bunx",
        cliCommand,
        "translate",
        "--project-id",
        projectId,
        "--api-key",
        apiKey,
      ]);
    } catch (error) {
      logger.error(`Translation process failed: ${error}`);
      throw error;
    }
  }
}
