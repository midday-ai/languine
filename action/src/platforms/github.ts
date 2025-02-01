import { Octokit } from "octokit";
import { z } from "zod";
import type { GitPlatform } from "../types.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

const GithubEnvSchema = z.object({
  GITHUB_REPOSITORY: z.string(),
  GITHUB_REPOSITORY_OWNER: z.string(),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REF_NAME: z.string(),
  GITHUB_HEAD_REF: z.string(),
  GITHUB_BASE_REF: z.string().optional(),
});

export class GitHubProvider implements GitPlatform {
  #_octokit?: Octokit;
  #token?: string;
  #owner: string;
  #repo: string;
  #branch: string;

  constructor() {
    const { branch, owner, repository, token } = this.getPlatformConfig();

    this.#branch = branch;
    this.#owner = owner;
    this.#repo = repository;
    this.#token = token;
  }

  get octokit(): Octokit {
    if (!this.#_octokit) {
      this.#_octokit = new Octokit({ auth: this.#token });
    }

    return this.#_octokit;
  }

  async setupGit() {
    logger.info("Setting up Git for GitHub...");

    await execAsync('git config --global user.name "Languine Bot"');
    await execAsync('git config --global user.email "bot@languine.ai"');
    await execAsync(`git config --global safe.directory ${process.cwd()}`);
  }

  async createOrUpdatePullRequest(options: {
    title: string;
    body: string;
  }) {
    const { title, body } = options;

    const existingPRNumber = await this.getOpenPullRequestNumber(this.#branch);

    if (existingPRNumber) {
      logger.info(`Updating existing PR #${existingPRNumber}`);

      await this.octokit.rest.pulls.update({
        pull_number: existingPRNumber,
        owner: this.#owner,
        repo: this.#repo,
        title,
        body,
      });
    } else {
      logger.info("Creating new PR...");
      await this.octokit.rest.pulls.create({
        owner: this.#owner,
        repo: this.#repo,
        head: this.#branch,
        base: this.#branch,
        title,
        body,
      });
    }
  }

  async getCurrentBranch() {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
  }

  async pullAndRebase() {
    logger.info(`Pulling and rebasing on ${this.#branch}...`);
    await execAsync(`git pull origin ${this.#branch} --rebase`);
  }

  async commitAndPush(options: {
    message: string;
  }) {
    const { message } = options;
    logger.info(`Committing and pushing to ${this.#branch}...`);
    await execAsync(`git commit -m "${message}"`);
    await execAsync(`git push origin ${this.#branch} --force`);
  }

  async createBranch(branchName: string) {
    logger.info(`Creating new branch: ${branchName}`);
    await execAsync(`git checkout -b ${branchName}`);
  }

  async addChanges() {
    logger.info("Adding changes...");
    await execAsync("git add .");
  }

  async checkBotCommit() {
    const { stdout: lastCommitAuthor } = await execAsync(
      'git log -1 --pretty=format:"%an"',
    );

    return lastCommitAuthor.trim() === "Languine Bot";
  }

  async hasChanges() {
    const { stdout } = await execAsync("git status --porcelain");
    return stdout.trim() !== "";
  }

  private async getOpenPullRequestNumber(branch: string) {
    const { data } = await this.octokit.rest.pulls.list({
      owner: this.#owner,
      repo: this.#repo,
      head: `${this.#owner}:${branch}`,
      state: "open",
    });

    return data[0]?.number;
  }

  public getPlatformConfig() {
    const env = GithubEnvSchema.parse(process.env);

    return {
      branch: env.GITHUB_REF_NAME,
      owner: env.GITHUB_REPOSITORY_OWNER,
      repository: env.GITHUB_REPOSITORY.split("/")[1],
      token: env.GITHUB_TOKEN,
    };
  }
}
