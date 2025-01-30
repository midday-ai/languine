import type { GitPlatform } from "../platforms/git-platform-facade.ts";
import type { Config } from "../utils/config.ts";
import { logger } from "../utils/logger.ts";
import { BranchTask } from "./branch.ts";

export class PullRequestTask {
  private readonly branchTask: BranchTask;

  constructor(
    private readonly platform: GitPlatform,
    private readonly config: Config,
  ) {
    this.branchTask = new BranchTask(platform, config);
  }

  async createPullRequest(): Promise<boolean> {
    try {
      // Initial Git setup
      const isGitConfigured = await this.branchTask.setupGitConfig();
      if (!isGitConfigured) {
        throw new Error("Failed to configure Git");
      }

      // Check if last commit was from bot
      if (await this.branchTask.checkBotCommit()) {
        logger.info("Skipping as last commit was from bot");
        return false;
      }

      // Setup base branch
      const isBaseBranchSetup = await this.branchTask.setupBaseBranch();
      if (!isBaseBranchSetup) {
        throw new Error("Failed to setup base branch");
      }

      // Generate unique branch name
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const branchName = `languine/translation-update-${timestamp}`;

      // Create and setup feature branch
      const isFeatureBranchCreated =
        await this.branchTask.createFeatureBranch(branchName);
      if (!isFeatureBranchCreated) {
        throw new Error("Failed to create feature branch");
      }

      // Check for changes
      const hasChanges = await this.branchTask.hasChanges();
      if (!hasChanges) {
        logger.info("No changes to commit");
        return false;
      }

      // Commit and push changes
      const isCommitted = await this.branchTask.commitAndPush(branchName, true);

      if (!isCommitted) {
        throw new Error("Failed to commit and push changes");
      }

      // Create pull request
      logger.info("Creating pull request");

      await this.platform.createPullRequest({
        title: this.config.prTitle || this.config.commitMessage,
        body: this.config.prBody || this.getDefaultPrBody(),
        branch: branchName,
        baseBranch: this.config.baseBranch,
      });

      logger.info(
        `Pull request created from ${branchName} to ${this.config.baseBranch}`,
      );
      return true;
    } catch (error) {
      logger.error(`Pull request creation failed: ${error}`);
      return false;
    }
  }

  async updatePullRequest(branchName: string): Promise<boolean> {
    try {
      // Sync with base branch
      const isSynced = await this.branchTask.syncWithBase();
      if (!isSynced) {
        throw new Error("Failed to sync with base branch");
      }

      // Check for changes
      const hasChanges = await this.branchTask.hasChanges();
      if (!hasChanges) {
        logger.info("No changes to update");
        return false;
      }

      // Commit and push changes
      const isCommitted = await this.branchTask.commitAndPush(branchName, true);
      if (!isCommitted) {
        throw new Error("Failed to commit and push changes");
      }

      return true;
    } catch (error) {
      logger.error(`Pull request update failed: ${error}`);
      return false;
    }
  }

  private getDefaultPrBody(): string {
    return `
🌍 Translation Update

This PR contains the latest translations processed by [Languine](https://languine.ai).

**Changes Overview:**
✨ New and updated translations
✅ Quality validation completed
🤖 AI-enhanced translations applied

**Action Required:**
1. Please review the translation changes
2. Test in your development environment
3. Merge when ready

Need help? Check our [documentation](https://languine.ai/docs) or contact support@languine.ai.
    `.trim();
  }
}
