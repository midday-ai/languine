import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

export class TranslationService {
  #getCliCommand(cliVersion = "latest") {
    if (process.env.DEV_MODE === "true") {
      logger.debug("Using local CLI");
      // Linked CLI
      return "languine";
    }

    return `bunx languine@${cliVersion}`;
  }

  async runTranslation(config: Config) {
    try {
      const { apiKey, projectId, cliVersion } = config;

      const cliCommand = this.#getCliCommand(cliVersion);

      logger.debug(`CLI Command: ${cliCommand}`);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);
      logger.debug(`Working Directory: ${process.cwd()}`);

      const result = await execAsync(
        `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey}`,
      );

      logger.info(result.stdout);
    } catch (error) {
      logger.error(`Translation process failed: ${error}`);
      throw error;
    }
  }
}
