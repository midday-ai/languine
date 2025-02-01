import path from "node:path";
import type { TranslationService } from "../services/translation.ts";
import type { GitPlatform, GitWorkflow } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

export class BranchWorkflow implements GitWorkflow {
  constructor(
    private readonly gitProvider: GitPlatform,
    private readonly config: Config,
    private readonly translationService: TranslationService,
  ) {}

  async preRun() {
    try {
      await this.#setupGit();
      logger.info("Successfully configured Git");
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      throw new Error("Failed to configure Git");
    }
  }

  async run() {
    logger.info("Running branch workflow...");
    const { branch } = this.gitProvider.getPlatformConfig();

    await this.translationService.runTranslation(this.config);

    const hasChanges = await this.gitProvider.hasChanges();

    if (hasChanges) {
      logger.info("Changes detected, committing and pushing...");
      await this.gitProvider.addChanges();
      await this.gitProvider.commitAndPush({
        message: this.config.commitMessage,
        branch,
      });
    }

    return hasChanges;
  }

  async #setupGit() {
    const { branch } = this.gitProvider.getPlatformConfig();

    await this.gitProvider.setupGit();

    logger.info(`Fetching origin ${branch}`);
    await execAsync(`git fetch origin ${branch}`);

    logger.info(`Checking out ${branch}`);
    await execAsync(`git checkout ${branch} --`);

    logger.info("Git configured");

    if (await this.gitProvider.checkBotCommit()) {
      logger.info("Bot commit detected, skipping...");
      return;
    }

    const workingDir = path.resolve(
      process.cwd(),
      this.config?.workingDirectory,
    );

    if (workingDir !== process.cwd()) {
      logger.info(`Changing working directory to: ${workingDir}`);
      process.chdir(workingDir);
    }

    return true;
  }

  async postRun() {}
}
