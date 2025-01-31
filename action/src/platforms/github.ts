import { Octokit } from "octokit";
import { z } from "zod";
import type { GitPlatform } from "../types.ts";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";

const GithubEnvSchema = z.object({
  GITHUB_REPOSITORY: z.string(),
  GITHUB_REPOSITORY_OWNER: z.string(),
  GH_TOKEN: z.string(),
  GITHUB_REF_NAME: z.string(),
  GITHUB_HEAD_REF: z.string(),
  GITHUB_BASE_REF: z.string().optional(),
});

export class GitHubProvider implements GitPlatform {
  #octokit?: Octokit;
  #owner: string;
  #repo: string;
  #token: string;

  constructor() {
    const env = GithubEnvSchema.parse(process.env);
    this.#owner = env.GITHUB_REPOSITORY_OWNER;
    this.#repo = env.GITHUB_REPOSITORY.split("/")[1];
    this.#token = env.GH_TOKEN;

    console.log(this.#owner, this.#repo, this.#token);
  }

  private get octokit(): Octokit {
    if (!this.#octokit) {
      this.#octokit = new Octokit({ auth: this.#token });
    }
    return this.#octokit;
  }

  async configureGit() {
    logger.info("Configuring Git for GitHub...");

    await execAsync('git config --global user.name "Languine Bot"');
    await execAsync('git config --global user.email "bot@languine.ai"');
  }

  async createOrUpdatePullRequest(options: {
    title: string;
    body: string;
    branch: string;
    baseBranch: string;
  }) {
    const { title, body, branch, baseBranch } = options;

    const existingPRNumber = await this.getOpenPullRequestNumber(branch);

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
        head: branch,
        base: baseBranch,
        title,
        body,
      });
    }
  }

  async getCurrentBranch() {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
  }

  async pullAndRebase(branch: string) {
    logger.info(`Pulling and rebasing on ${branch}...`);
    await execAsync(`git pull origin ${branch} --rebase`);
  }

  async commitAndPush(options: {
    message: string;
    branch: string;
  }) {
    const { message, branch } = options;
    logger.info(`Committing and pushing to ${branch}...`);
    await execAsync(`git commit -m "${message}"`);
    await execAsync(`git push origin ${branch} --force`);
  }

  async createBranch(branchName: string) {
    logger.info(`Creating new branch: ${branchName}`);
    await execAsync(`git checkout -b ${branchName}`);
  }

  async stageChanges() {
    logger.info("Staging changes...");
    await execAsync("git add .");
  }

  async checkBotCommit() {
    const { stdout: lastCommitAuthor } = await execAsync(
      'git log -1 --pretty=format:"%an"',
    );

    return lastCommitAuthor.trim() === "Languine Bot";
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
}
