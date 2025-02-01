import type { PlatformConfig } from "./platforms/provider.ts";

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
  getOpenPullRequestNumber(branch: string): Promise<number | undefined>;
  closeOpenPullRequest(options: { pullRequestNumber: number }): Promise<void>;
  addCommentToPullRequest(options: {
    pullRequestNumber: number;
    body: string;
  }): Promise<void>;
}

export interface GitWorkflow {
  preRun(): Promise<void>;
  run(): Promise<boolean>;
  postRun(): Promise<void>;
}
