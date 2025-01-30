import { Octokit } from "octokit";
import { z } from "zod";
import { execAsync } from "../utils/exec.ts";
import { logger } from "../utils/logger.ts";
import { Provider } from "./provider.ts";

/**
 * GitHub-specific implementation of the Provider class.
 * Handles GitHub Actions authentication and API interactions.
 */
export class GitHubProvider extends Provider {
  private _octokit?: Octokit;

  private get octokit() {
    if (!this._octokit) {
      this._octokit = new Octokit({ auth: this.token });
    }
    return this._octokit;
  }

  get providerConfig() {
    const env = z
      .object({
        GITHUB_REPOSITORY: z.string(),
        GITHUB_REPOSITORY_OWNER: z.string(),
        GITHUB_REF_NAME: z.string(),
        GITHUB_HEAD_REF: z.string(),
        GITHUB_BASE_REF: z.string().optional(),
        GITHUB_TOKEN: z.string(),
      })
      .parse(process.env);

    return {
      baseBranch: env.GITHUB_BASE_REF || "main",
      repositoryOwner: this.owner,
      repositoryName: this.repo,
      token: this.token,
    };
  }

  async branchExists(props: { branch: string }): Promise<boolean> {
    return await this.octokit.rest.repos
      .getBranch({
        branch: props.branch,
        owner: this.owner,
        repo: this.repo,
      })
      .then((r) => r.data)
      .then((v) => !!v)
      .catch((r) => (r.status === 404 ? false : Promise.reject(r)));
  }

  async getOpenPullRequestNumber(props: { branch: string }): Promise<
    number | undefined
  > {
    return await this.octokit.rest.pulls
      .list({
        head: `${this.owner}:${props.branch}`,
        owner: this.owner,
        repo: this.repo,
        base: this.providerConfig.baseBranch,
        state: "open",
      })
      .then(({ data }) => data[0]?.number);
  }

  async closePullRequest(props: { pullRequestNumber: number }): Promise<void> {
    await this.octokit.rest.pulls.update({
      pull_number: props.pullRequestNumber,
      owner: this.owner,
      repo: this.repo,
      state: "closed",
    });
  }

  async createPullRequest(props: {
    head: string;
    title: string;
    body?: string;
    base: string;
  }): Promise<number> {
    const { data } = await this.octokit.rest.pulls.create({
      owner: this.owner,
      repo: this.repo,
      head: props.head,
      base: props.base,
      title: props.title,
      body: props.body,
    });
    return data.number;
  }

  async commentOnPullRequest(props: {
    pullRequestNumber: number;
    body: string;
  }): Promise<void> {
    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: props.pullRequestNumber,
      body: props.body,
    });
  }

  buildPullRequestUrl(pullRequestNumber: number): string {
    return `https://github.com/${this.owner}/${this.repo}/pull/${pullRequestNumber}`;
  }

  async configureGit(): Promise<void> {
    // Configure Git for GitHub authentication
    const remoteUrl = `https://x-access-token:${this.token}@github.com/${this.owner}/${this.repo}.git`;
    await execAsync(`git remote set-url origin ${remoteUrl}`);

    // Ensure we have the full Git history
    await execAsync("git fetch --unshallow || true");

    // Configure Git to handle line endings
    await execAsync("git config --global core.autocrlf false");
  }

  async getCurrentBranch(): Promise<string> {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
  }

  async pullAndRebase(baseBranch: string): Promise<void> {
    logger.info(`Rebasing on ${baseBranch}`);
    await execAsync(`git pull origin ${baseBranch} --rebase`);
  }

  async commitAndPush(options: {
    message: string;
    branch: string;
  }): Promise<void> {
    const { message, branch } = options;
    logger.info(`Committing and pushing to ${branch}`);
    await execAsync(`git commit -m "${message}"`);
    await execAsync(`git push origin ${branch} --force`);
  }

  async createBranch(branchName: string): Promise<void> {
    logger.info(`Creating new branch: ${branchName}`);
    await execAsync(`git checkout -b ${branchName}`);
  }

  async stageChanges(): Promise<void> {
    logger.info("Staging changes");
    await execAsync("git add .");
  }
}
