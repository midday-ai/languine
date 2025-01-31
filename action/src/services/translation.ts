import path from "node:path";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

interface ExecError extends Error {
  stderr?: string;
}

export class TranslationService {
  async #setupDevCli() {
    logger.info("Setting up CLI in dev mode...");
    const cliPath = path.join(process.cwd(), "packages/cli");
    const bunPath = "/usr/local/bin/bun";

    logger.info("Installing CLI dependencies...");
    await execAsync(`${bunPath} install`, { cwd: cliPath });

    logger.info("Building CLI...");
    await execAsync(`${bunPath} run build`, { cwd: cliPath });

    logger.info("Linking CLI...");
    await execAsync(`${bunPath} link`, { cwd: cliPath });
  }

  #getCliCommand(cliVersion = "latest") {
    if (process.env.DEV_MODE === "true") {
      logger.debug("Using local CLI");
      const bunPath = "/usr/local/bin/bun";
      return `${bunPath} ${process.env.LANGUINE_CLI || "/github/workspace/packages/cli/dist/index.js"}`;
    }

    return `bunx languine@${cliVersion}`;
  }

  async runTranslation(config: Config) {
    try {
      const { apiKey, projectId, cliVersion, workingDirectory } = config;

      if (process.env.DEV_MODE === "true") {
        await this.#setupDevCli();
      }

      const cliCommand = this.#getCliCommand(cliVersion);

      logger.debug(`CLI Command: ${cliCommand}`);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);
      logger.debug(`Working Directory: ${process.cwd()}`);

      // Change to working directory if specified
      const cwd = workingDirectory
        ? path.resolve(process.cwd(), workingDirectory)
        : process.cwd();

      const result = await execAsync(
        `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey}`,
        { cwd },
      );

      logger.info(result.stdout);
    } catch (error) {
      logger.error(`Translation process failed: ${error}`);
      throw error;
    }
  }
}
