/**
 * Interface for Git provider operations.
 * Implemented by specific Git platforms (GitHub, GitLab, etc.)
 */
export interface GitProvider {
  /**
   * Configure Git for the specific platform
   */
  configureGit(): Promise<void>;

  /**
   * Create a pull request
   */
  createPullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void>;

  /**
   * Get the current branch name
   */
  getCurrentBranch(): Promise<string>;

  /**
   * Pull and rebase changes from the base branch
   */
  pullAndRebase(baseBranch: string): Promise<void>;

  /**
   * Commit and push changes
   */
  commitAndPush(options: { message: string; branch: string }): Promise<void>;

  /**
   * Create a new branch
   */
  createBranch(branchName: string): Promise<void>;

  /**
   * Stage all changes
   */
  stageChanges(): Promise<void>;
}
