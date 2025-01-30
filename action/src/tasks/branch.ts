import type { Provider } from "../platforms/provider.ts";
import { logger } from "../utils/logger.ts";

/**
 * Handles Git branch-related operations
 */
export class BranchTask {
  constructor(private readonly provider: Provider) {}

  /**
   * Set up Git configuration for the provider
   */
  async setupGitConfig(): Promise<void> {
    try {
      await this.provider.configureGit();
      logger.info("Git configuration completed successfully");
    } catch (error) {
      logger.error(`Failed to configure Git: ${error}`);
      throw error;
    }
  }

  /**
   * Check if there are any changes in the current branch
   */
  async hasChanges(): Promise<boolean> {
    try {
      const changes = await this.provider.hasChanges();
      logger.info(`Changes detected: ${changes}`);
      return changes;
    } catch (error) {
      logger.error(`Failed to check for changes: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new branch with the given name
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      await this.provider.createBranch(branchName);
      logger.info(`Created branch: ${branchName}`);
    } catch (error) {
      logger.error(`Failed to create branch ${branchName}: ${error}`);
      throw error;
    }
  }

  /**
   * Stage and commit changes with the given message
   */
  async commitChanges(message: string): Promise<void> {
    try {
      await this.provider.stageChanges();
      await this.provider.commitChanges(message);
      logger.info("Changes committed successfully");
    } catch (error) {
      logger.error(`Failed to commit changes: ${error}`);
      throw error;
    }
  }

  /**
   * Push changes to the remote repository
   */
  async pushChanges(): Promise<void> {
    try {
      await this.provider.pushChanges();
      logger.info("Changes pushed successfully");
    } catch (error) {
      logger.error(`Failed to push changes: ${error}`);
      throw error;
    }
  }
}
