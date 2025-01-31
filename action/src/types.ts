/**
 * Interface for Git platform operations.
 * Implemented by specific Git platforms (GitHub, GitLab, etc.)
 */
export interface GitPlatform {
  configureGit(): Promise<void>;
  createOrUpdatePullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void>;
  getCurrentBranch(): Promise<string>;
  pullAndRebase(branch: string): Promise<void>;
  commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void>;
  createBranch(branchName: string): Promise<void>;
  stageChanges(): Promise<void>;
  checkBotCommit(): Promise<boolean>;
}

/**
 * Base interface for Git workflows.
 * Common functionality shared between branch and PR workflows.
 */
export interface GitWorkflow {
  preRun(): Promise<void>;
  postRun(): Promise<void>;
  setupGitConfig(): Promise<boolean>;
  checkBotCommit(): Promise<boolean>;
  setupBaseBranch(): Promise<boolean>;
  hasChanges(): Promise<boolean>;
}

/**
 * Branch workflow interface.
 * Handles direct commits to branches without pull requests.
 */
export interface BranchWorkflow extends GitWorkflow {
  commitAndPush(branch: string): Promise<boolean>;
}

/**
 * Pull request workflow interface.
 * Handles creating and updating pull requests.
 */
export interface PullRequestWorkflow extends GitWorkflow {
  createPullRequest(): Promise<boolean>;
}
