import { GitHubPlatform } from "./github.ts";

export interface GitPlatform {
  configureGit(): Promise<void>;
  createPullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void>;
  getCurrentBranch(): Promise<string>;
  pullAndRebase(baseBranch: string): Promise<void>;
  commitAndPush(options: { message: string; branch: string }): Promise<void>;
  createBranch(branchName: string): Promise<void>;
  stageChanges(): Promise<void>;
}

export class GitPlatformFacade implements GitPlatform {
  private static instance: GitPlatformFacade;
  private platform: GitPlatform;

  private constructor() {
    this.platform = new GitHubPlatform();
  }

  public static getInstance(): GitPlatformFacade {
    if (!GitPlatformFacade.instance) {
      GitPlatformFacade.instance = new GitPlatformFacade();
    }
    return GitPlatformFacade.instance;
  }

  public async configureGit(): Promise<void> {
    await this.platform.configureGit();
  }

  public async createPullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void> {
    await this.platform.createPullRequest(options);
  }

  public async getCurrentBranch(): Promise<string> {
    return this.platform.getCurrentBranch();
  }

  public async commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void> {
    await this.platform.commitAndPush(options);
  }

  public async pullAndRebase(baseBranch: string): Promise<void> {
    await this.platform.pullAndRebase(baseBranch);
  }

  public async createBranch(branchName: string): Promise<void> {
    await this.platform.createBranch(branchName);
  }

  public async stageChanges(): Promise<void> {
    await this.platform.stageChanges();
  }
}
