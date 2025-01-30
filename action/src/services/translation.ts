import type { GitPlatform } from "../platforms/git-platform-facade.ts";
import { BranchTask } from "../tasks/branch.ts";
import { PullRequestTask } from "../tasks/pull-request.ts";
import type { TranslationService } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

export class LanguineTranslationService implements TranslationService {
  constructor(private readonly platform: GitPlatform) {}

  private getCliCommand(cliVersion = "latest"): string {
    if (process.env.DEV_MODE === "true") {
      logger.debug("Using local CLI");
      return `bun ${process.env.LANGUINE_CLI || "languine"}`;
    }
    return `bunx languine@${cliVersion}`;
  }

  private async handleDirectCommit(config: Config): Promise<void> {
    const branchTask = new BranchTask(this.platform, config);

    // Setup Git and check for bot commits
    const isGitConfigured = await branchTask.setupGitConfig();
    if (!isGitConfigured) {
      throw new Error("Failed to configure Git");
    }

    if (await branchTask.checkBotCommit()) {
      logger.info("Skipping as last commit was from bot");
      return;
    }

    // Setup base branch
    const isBaseBranchSetup = await branchTask.setupBaseBranch();
    if (!isBaseBranchSetup) {
      throw new Error("Failed to setup base branch");
    }

    // Commit and push changes
    const isCommitted = await branchTask.commitAndPush(config.baseBranch);
    if (!isCommitted) {
      throw new Error("Failed to commit changes");
    }

    logger.info(`Changes committed and pushed to ${config.baseBranch}`);
  }

  private async handlePullRequest(config: Config): Promise<void> {
    const pullRequestTask = new PullRequestTask(this.platform, config);
    const success = await pullRequestTask.createPullRequest();

    if (!success) {
      throw new Error("Failed to create pull request");
    }
  }

  async runTranslation(config: Config): Promise<void> {
    try {
      const { apiKey, projectId, cliVersion } = config;
      const branchTask = new BranchTask(this.platform, config);

      // Run translation
      const cliCommand = this.getCliCommand(cliVersion);
      logger.debug(`Project ID: ${projectId}`);
      logger.debug(`CLI Version: ${cliVersion}`);

      await execAsync(
        `${cliCommand} translate --project-id ${projectId} --api-key ${apiKey}`,
      );

      // Check for changes
      const hasChanges = await branchTask.hasChanges();
      if (!hasChanges) {
        logger.info("No translation changes detected");
        return;
      }

      // Handle changes based on workflow type
      if (config.createPullRequest) {
        await this.handlePullRequest(config);
      } else {
        await this.handleDirectCommit(config);
      }
    } catch (error) {
      logger.error(`Translation process failed: ${error}`);
      throw error;
    }
  }

  async hasChanges(): Promise<boolean> {
    const branchTask = new BranchTask(this.platform, {} as Config);

    return branchTask.hasChanges();
  }
}
