import type { GitPlatform } from "../types.ts";
import { GitHubPlatform } from "./github.ts";

export class GitPlatformFacade {
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

  public async createOrUpdatePullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void> {
    return this.platform.createOrUpdatePullRequest(options);
  }

  public async getCurrentBranch(): Promise<string> {
    return this.platform.getCurrentBranch();
  }

  public async commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void> {
    return this.platform.commitAndPush(options);
  }

  public async pullAndRebase(branch: string): Promise<void> {
    return this.platform.pullAndRebase(branch);
  }
}
