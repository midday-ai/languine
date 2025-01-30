import type { TranslationService } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

export class LanguineTranslationService implements TranslationService {
  private getCliCommand(cliVersion = "latest"): string {
    if (process.env.DEV_MODE === "true") {
      logger.debug("Using local CLI");
      return `bun ${process.env.LANGUINE_CLI || "languine"}`;
    }

    return `bunx languine@${cliVersion}`;
  }

  async runTranslation(config: Config): Promise<void> {
    const { apiKey, projectId, cliVersion } = config;

    // Get the appropriate CLI command
    const cliCommand = this.getCliCommand(cliVersion);

    logger.debug(`Project ID: ${projectId}`);
    logger.debug(`CLI Version: ${cliVersion}`);

    // Use the local base branch for comparison since we have it from checkout
    const command = `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey}`;

    await execAsync(command);
  }

  async hasChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync("git status --porcelain");
      logger.debug(`Git status output: ${stdout}`);

      return stdout.trim().length > 0;
    } catch (error) {
      logger.error(error instanceof Error ? error : String(error));
      return false;
    }
  }

  async stageChanges(): Promise<void> {
    await execAsync("git add .");
  }
}
