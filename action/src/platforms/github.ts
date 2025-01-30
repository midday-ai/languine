import { execAsync } from "../utils/exec.ts";
import type { GitPlatform } from "./git-platform-facade.ts";

export class GitHubPlatform implements GitPlatform {
  async configureGit(): Promise<void> {
    // GitHub Actions specific configuration
    if (process.env.GITHUB_TOKEN) {
      const remoteUrl = `https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
      await execAsync(`git remote set-url origin ${remoteUrl}`);
    }
  }

  async createPullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void> {
    const { title, body, branch, baseBranch } = options;

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is required for creating pull requests");
    }

    const repo = process.env.GITHUB_REPOSITORY;
    if (!repo) {
      throw new Error("GITHUB_REPOSITORY environment variable is not set");
    }

    const [owner, repoName] = repo.split("/");
    const url = `https://api.github.com/repos/${owner}/${repoName}/pulls`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        head: branch,
        base: baseBranch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create pull request: ${error}`);
    }
  }

  async getCurrentBranch(): Promise<string> {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
  }

  async pullAndRebase(baseBranch: string): Promise<void> {
    await execAsync(`git pull origin ${baseBranch} --rebase`);
  }

  async commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void> {
    const { message, branch } = options;
    await execAsync(`git commit -m "${message}"`);
    await execAsync(`git push origin ${branch}`);
  }

  async createBranch(branchName: string): Promise<void> {
    await execAsync(`git checkout -b ${branchName}`);
  }

  async stageChanges(): Promise<void> {
    await execAsync("git add .");
  }
}
