import type { PlatformConfig } from "./platforms/provider.ts";

/**
 * Interface for Git platform operations.
 * Implemented by specific Git platforms (GitHub, GitLab, etc.)
 */
export interface GitPlatform {
  getPlatformConfig(): PlatformConfig;
  setupGit(): Promise<void>;
  createOrUpdatePullRequest(options: {
    title: string;
    body: string;
    branch: string;
  }): Promise<void>;
  getCurrentBranch(): Promise<string>;
  pullAndRebase(branch: string): Promise<void>;
  commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void>;
  createBranch(branchName: string): Promise<void>;
  addChanges(): Promise<void>;
  hasChanges(): Promise<boolean>;
  checkBotCommit(): Promise<boolean>;
}

/**
 * Base interface for Git workflows.
 * Common functionality shared between branch and PR workflows.
 */
export interface GitWorkflow {
  preRun(): Promise<void>;
  run(): Promise<boolean>;
  postRun(): Promise<void>;
}
