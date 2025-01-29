import { Octokit } from "octokit";
import Z from "zod";
import { GitProvider } from "./core.js";

interface GitHubProviderConfig {
  ghToken?: string;
  baseBranchName: string;
  repositoryOwner: string;
  repositoryName: string;
}

export class GitHubPlatformKit extends GitProvider<GitHubProviderConfig> {
  private _octokit?: Octokit;

  get octokit() {
    if (!this._octokit) {
      this._octokit = new Octokit({ auth: this.providerConfig.ghToken });
    }
    return this._octokit;
  }

  async branchExists({ branch }: { branch: string }) {
    return await this.octokit.rest.repos
      .getBranch({
        branch,
        owner: this.providerConfig.repositoryOwner,
        repo: this.providerConfig.repositoryName,
      })
      .then((r) => r.data)
      .then((v) => !!v)
      .catch((r) => (r.status === 404 ? false : Promise.reject(r)));
  }

  async getOpenPullRequestNumber({ branch }: { branch: string }) {
    return await this.octokit.rest.pulls
      .list({
        head: `${this.providerConfig.repositoryOwner}:${branch}`,
        owner: this.providerConfig.repositoryOwner,
        repo: this.providerConfig.repositoryName,
        base: this.providerConfig.baseBranchName,
        state: "open",
      })
      .then(({ data }) => data[0])
      .then((pr) => pr?.number);
  }

  async closePullRequest({ pullRequestNumber }: { pullRequestNumber: number }) {
    await this.octokit.rest.pulls.update({
      pull_number: pullRequestNumber,
      owner: this.providerConfig.repositoryOwner,
      repo: this.providerConfig.repositoryName,
      state: "closed",
    });
  }

  async createPullRequest({
    head,
    title,
    body,
  }: { head: string; title: string; body?: string }) {
    return await this.octokit.rest.pulls
      .create({
        head,
        title,
        body,
        owner: this.providerConfig.repositoryOwner,
        repo: this.providerConfig.repositoryName,
        base: this.providerConfig.baseBranchName,
      })
      .then(({ data }) => data.number);
  }

  async commentOnPullRequest({
    pullRequestNumber,
    body,
  }: { pullRequestNumber: number; body: string }) {
    await this.octokit.rest.issues.createComment({
      issue_number: pullRequestNumber,
      body,
      owner: this.providerConfig.repositoryOwner,
      repo: this.providerConfig.repositoryName,
    });
  }

  get providerConfig() {
    const env = Z.object({
      GITHUB_REPOSITORY: Z.string(),
      GITHUB_REPOSITORY_OWNER: Z.string(),
      GITHUB_REF_NAME: Z.string(),
      GITHUB_HEAD_REF: Z.string(),
      GH_TOKEN: Z.string().optional(),
    }).parse(process.env);

    const baseBranchName = !env.GITHUB_REF_NAME.endsWith("/merge")
      ? env.GITHUB_REF_NAME
      : env.GITHUB_HEAD_REF;

    return {
      ghToken: env.GH_TOKEN,
      baseBranchName,
      repositoryOwner: env.GITHUB_REPOSITORY_OWNER,
      repositoryName: env.GITHUB_REPOSITORY.split("/")[1],
    };
  }

  buildPullRequestUrl(pullRequestNumber: number) {
    const { repositoryOwner, repositoryName } = this.providerConfig;
    return `https://github.com/${repositoryOwner}/${repositoryName}/pull/${pullRequestNumber}`;
  }
}
