import { note } from "@clack/prompts";
import { Octokit } from "octokit";
import type { GitPlatform } from "../types.ts";
import { execAsync } from "../utils/exec.ts";

export class GitHubPlatform implements GitPlatform {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      note(
        "GITHUB_TOKEN is missing, please set the GITHUB_TOKEN environment variable.",
        "Error",
      );

      process.exit(1);
    }

    this.octokit = new Octokit({ auth: token });

    const repository = process.env.GITHUB_REPOSITORY;

    if (!repository) {
      note(
        "GITHUB_REPOSITORY is missing, please set the GITHUB_REPOSITORY environment variable.",
        "Error",
      );

      process.exit(1);
    }

    [this.owner, this.repo] = repository.split("/");
  }

  async createOrUpdatePullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }): Promise<void> {
    const { title, body, branch, baseBranch } = options;

    // Check if PR already exists
    const { data: existingPRs } = await this.octokit.rest.pulls.list({
      owner: this.owner,
      repo: this.repo,
      head: `${this.owner}:${branch}`,
      base: baseBranch,
      state: "open",
    });

    if (existingPRs.length > 0) {
      // Update existing PR
      await this.octokit.rest.pulls.update({
        owner: this.owner,
        repo: this.repo,
        pull_number: existingPRs[0].number,
        title,
        body,
      });
    } else {
      // Create new PR
      await this.octokit.rest.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head: branch,
        base: baseBranch,
      });
    }
  }

  async getCurrentBranch(): Promise<string> {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
  }

  async commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void> {
    const { message, branch } = options;

    await execAsync('git config --global user.email "bot@languine.ai"');
    await execAsync('git config --global user.name "languine-bot"');
    await execAsync(`git commit -m "${message}"`);
    await execAsync(`git push origin ${branch}`);
  }

  async pullAndRebase(branch: string): Promise<void> {
    await execAsync(`git pull origin ${branch} --rebase`);
  }
}
