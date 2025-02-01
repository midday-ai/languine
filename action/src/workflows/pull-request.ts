import path from "node:path";
import type { TranslationService } from "../services/translation.ts";
import type { GitPlatform, GitWorkflow } from "../types.ts";
import type { Config } from "../utils/config.ts";
import { logger } from "../utils/logger.ts";

export class PullRequestWorkflow implements GitWorkflow {
  private readonly branchName: string;

  constructor(
    private readonly gitProvider: GitPlatform,
    private readonly config: Config,
    private readonly translationService: TranslationService,
  ) {
    const { baseBranch } = this.gitProvider.getPlatformConfig();
    this.branchName = `languine/${baseBranch}`;
  }

  async preRun(): Promise<void> {
    try {
      await this.#setupGit();
      logger.info("Successfully configured Git");

      // Get base branch from config
      const { baseBranch } = this.gitProvider.getPlatformConfig();

      // Make sure we're on the base branch first
      logger.info(`Checking out base branch ${baseBranch}`);
      await this.gitProvider.createBranch(baseBranch);

      // Run translation service on base branch to detect changes
      logger.info("Running translation service to detect changes...");
      await this.translationService.runTranslation(this.config);

      // Check if we have any changes before proceeding
      const hasChanges = await this.gitProvider.hasChanges();
      if (!hasChanges) {
        logger.info("No translation changes detected, skipping PR creation");
        return;
      }

      // Now handle the feature branch
      const currentBranch = await this.gitProvider.getCurrentBranch();
      const existingPRNumber = await this.gitProvider.getOpenPullRequestNumber(
        this.branchName,
      );

      // If there's an existing PR, close it now
      if (existingPRNumber) {
        logger.info(`Closing existing PR #${existingPRNumber}`);
        await this.gitProvider.closeOpenPullRequest({
          pullRequestNumber: existingPRNumber,
        });
      }

      // Create or switch to our branch
      if (currentBranch === this.branchName) {
        logger.info(`Already on branch ${this.branchName}`);
        await this.gitProvider.pullAndRebase(baseBranch);
      } else {
        logger.info(`Creating new branch ${this.branchName}`);
        await this.gitProvider.createBranch(this.branchName);
      }

      // Stage the changes we detected
      await this.gitProvider.addChanges();
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async run(): Promise<boolean> {
    logger.info("Running pull request workflow...");

    try {
      // Check if we have any changes to commit
      const hasChanges = await this.gitProvider.hasChanges();

      if (hasChanges) {
        logger.info("Changes detected, committing and pushing...");
        await this.gitProvider.commitAndPush({
          message: this.config.commitMessage,
          branch: this.branchName,
        });
      } else {
        logger.info("No changes to commit");
      }

      return hasChanges;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }

  async postRun(): Promise<void> {
    try {
      // Only create PR if we have changes
      const hasChanges = await this.gitProvider.hasChanges();
      if (!hasChanges) {
        logger.info("No changes detected, skipping PR creation");
        return;
      }

      // Check for existing PR again (in case it was created during our run)
      const existingPRNumber = await this.gitProvider.getOpenPullRequestNumber(
        this.branchName,
      );

      // Create new PR
      logger.info("Creating new pull request...");
      await this.gitProvider.createOrUpdatePullRequest({
        title: this.config.prTitle || "chore: update translations",
        body: this.config.prBody || this.#getPrBodyContent(),
        branch: this.branchName,
      });

      // If there was an existing PR, add a comment about the new one
      if (existingPRNumber) {
        logger.info(`Adding comment to old PR #${existingPRNumber}`);
        await this.gitProvider.addCommentToPullRequest({
          pullRequestNumber: existingPRNumber,
          body: "This PR is now outdated. A new version has been created.",
        });
      }
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "Unknown error");
      throw error;
    }
  }

  async #setupGit() {
    await this.gitProvider.setupGit();

    const workingDir = path.resolve(
      process.cwd(),
      this.config?.workingDirectory,
    );

    if (workingDir !== process.cwd()) {
      logger.info(`Changing working directory to: ${workingDir}`);
      process.chdir(workingDir);
    }
  }

  #getPrBodyContent(): string {
    return `
🌐 Translation Updates

This PR contains automated translation updates from Languine.ai. The changes have been automatically generated and quality-checked.

### What Changed
- Updated translations to match latest source strings
- Maintained consistent terminology across languages
- Preserved existing translations where possible
- Applied quality checks and formatting

### Next Steps
1. Review the changes, focusing on key user-facing strings
2. Test the translations in context if possible
3. Approve and merge when ready

> Need help or have questions? Visit our [documentation](https://languine.ai/docs) or [contact support](https://languine.ai/support).

---
_Generated by [Languine](https://languine.ai) - Automated Translation Infrastructure_
    `.trim();
  }
}
