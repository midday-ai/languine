import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

export class TranslationService {
  #getCliCommand(cliVersion = "latest"): string {
    if (process.env.DEV_MODE === "true") {
      logger.debug("Using local CLI");
      return `bun ${process.env.LANGUINE_CLI || "languine"}`;
    }
    return `bunx languine@${cliVersion}`;
  }

  async runTranslation(config: Config): Promise<void> {
    try {
      const { apiKey, projectId, cliVersion } = config;

      // Run translation
      const cliCommand = this.#getCliCommand(cliVersion);

      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);

      await execAsync(
        `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey}`,
      );
    } catch (error) {
      logger.error(`Translation process failed: ${error}`);
      throw error;
    }
  }
}
