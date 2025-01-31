import { spawnSync } from "node:child_process";
import path from "node:path";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

interface ExecError extends Error {
  stderr?: string;
}

export class TranslationService {
  #getCliCommand(cliVersion = "latest") {
    if (process.env.DEV_MODE === "true") {
      const cliPath = path.join(process.cwd(), "packages/cli");

      logger.debug("Using local CLI");
      return {
        script: path.join(cliPath, "src/index.ts"),
        args: [],
      };
    }

    return {
      script: "bunx",
      args: [`languine@${cliVersion}`],
    };
  }

  async runTranslation(config: Config) {
    try {
      const { apiKey, projectId, cliVersion, workingDirectory } = config;

      const command = this.#getCliCommand(cliVersion);

      logger.debug(`CLI Command: bun run ${command.script}`);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);
      logger.debug(`Working Directory: ${process.cwd()}`);

      // Change to working directory if specified
      const cwd = workingDirectory
        ? path.resolve(process.cwd(), workingDirectory)
        : process.cwd();

      const args = [
        ...command.args,
        "translate",
        "--project-id",
        projectId,
        "--api-key",
        apiKey,
      ];
      const result = spawnSync("bun", ["run", command.script, ...args], {
        cwd,
        stdio: "inherit",
      });

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
