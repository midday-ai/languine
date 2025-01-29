import { execSync } from "node:child_process";
import { BranchOperation } from "./branch.js";

export class TranslationPullRequestManager extends BranchOperation {
  async preRun() {
    const canContinue = await super.preRun?.();

    if (!canContinue) {
      return false;
    }

    this.ora.start("Generating branch name");
    this.translationBranchName = this.generateTranslationBranchName();
    this.ora.succeed(`Generated branch name: ${this.translationBranchName}`);

    this.ora.start("Checking branch status");
    const branchExists = await this.verifyBranchExists(
      this.translationBranchName,
    );
    this.ora.succeed(
      branchExists ? "Found existing branch" : "Branch not found",
    );

    if (branchExists) {
      this.ora.start(`Switching to ${this.translationBranchName}`);
      this.switchToTranslationBranch(this.translationBranchName);
      this.ora.succeed(`Switched to ${this.translationBranchName}`);

      this.ora.start(
        `Updating from ${this.provider.providerConfig.baseBranchName}`,
      );
      this.updateTranslationBranch();
      this.ora.succeed(`Branch ${this.translationBranchName} is up to date`);
    } else {
      this.ora.start(`Setting up new branch ${this.translationBranchName}`);
      this.initializeTranslationBranch(this.translationBranchName);
      this.ora.succeed(`New branch ${this.translationBranchName} ready`);
    }

    return true;
  }

  override async run() {
    return super.run(true);
  }

  async postRun() {
    if (!this.translationBranchName) {
      throw new Error(
        "translationBranchName is not set. Did you forget to call preRun?",
      );
    }

    this.ora.start("Looking for existing pull request");
    const pullRequestNumber = await this.manageTranslationPullRequest(
      this.translationBranchName,
    );
    this.ora.succeed(
      `Pull request available at: ${this.provider.buildPullRequestUrl(pullRequestNumber)}`,
    );
  }

  private generateTranslationBranchName(): string {
    return `languine/${this.provider.providerConfig.baseBranchName}`;
  }

  private async verifyBranchExists(branchName: string) {
    return this.provider.branchExists({
      branch: branchName,
    });
  }

  private async manageTranslationPullRequest(translationBranchName: string) {
    this.ora.start(
      `Searching for open PR from ${translationBranchName} to ${this.provider.providerConfig.baseBranchName}`,
    );
    const existingPrNumber = await this.provider.getOpenPullRequestNumber({
      branch: translationBranchName,
    });

    this.ora.succeed(
      existingPrNumber ? "Found existing PR" : "No existing PR found",
    );

    if (existingPrNumber) {
      this.ora.start(`Closing PR #${existingPrNumber}`);
      await this.provider.closePullRequest({
        pullRequestNumber: existingPrNumber,
      });
      this.ora.succeed(`Closed PR #${existingPrNumber}`);
    }

    this.ora.start("Opening new pull request");

    const newPrNumber = await this.provider.createPullRequest({
      head: translationBranchName,
      title: this.provider.config.pullRequestTitle,
      body: this.generatePullRequestDescription(),
    });

    this.ora.succeed(`Opened PR #${newPrNumber}`);

    if (existingPrNumber) {
      this.ora.start(`Adding reference to PR #${existingPrNumber}`);
      await this.provider.commentOnPullRequest({
        pullRequestNumber: existingPrNumber,
        body: `This PR has been superseded by a new version at ${this.provider.buildPullRequestUrl(newPrNumber)}`,
      });

      this.ora.succeed(`Added reference to PR #${existingPrNumber}`);
    }

    return newPrNumber;
  }

  private switchToTranslationBranch(branchName: string) {
    execSync(`git fetch origin ${branchName}`, { stdio: "inherit" });
    execSync(`git checkout -b ${branchName}`, {
      stdio: "inherit",
    });
  }

  private initializeTranslationBranch(branchName: string) {
    execSync(
      `git fetch origin ${this.provider.providerConfig.baseBranchName}`,
      { stdio: "inherit" },
    );
    execSync(
      `git checkout -b ${branchName} origin/${this.provider.providerConfig.baseBranchName}`,
      {
        stdio: "inherit",
      },
    );
  }

  private updateTranslationBranch() {
    if (!this.translationBranchName) {
      throw new Error("translationBranchName is not set");
    }

    this.ora.start(
      `Pulling updates from ${this.provider.providerConfig.baseBranchName}`,
    );

    execSync(
      `git fetch origin ${this.provider.providerConfig.baseBranchName}`,
      { stdio: "inherit" },
    );

    this.ora.succeed(
      `Retrieved updates from ${this.provider.providerConfig.baseBranchName}`,
    );

    try {
      this.ora.start("Rebasing branch");

      execSync(
        `git rebase origin/${this.provider.providerConfig.baseBranchName}`,
        { stdio: "inherit" },
      );

      this.ora.succeed("Branch rebased successfully");
    } catch (error) {
      this.ora.warn("Rebase failed - trying alternative update method");

      this.ora.start("Cleaning up failed rebase");
      execSync("git rebase --abort", { stdio: "inherit" });
      this.ora.succeed("Cleaned up failed rebase");

      this.ora.start(
        `Resetting branch to ${this.provider.providerConfig.baseBranchName}`,
      );

      execSync(
        `git reset --hard origin/${this.provider.providerConfig.baseBranchName}`,
        { stdio: "inherit" },
      );

      this.ora.succeed(
        `Reset to ${this.provider.providerConfig.baseBranchName} complete`,
      );

      this.ora.start("Recovering translation files");
      const targetFileNames = execSync(
        `bunx languine@${this.provider.config.version} check --base ${this.provider.providerConfig.baseBranchName}`,
        { encoding: "utf8" },
      )
        .split("\n")
        .filter(Boolean);

      execSync(`git fetch origin ${this.translationBranchName}`, {
        stdio: "inherit",
      });

      for (const file of targetFileNames) {
        try {
          execSync(`git checkout FETCH_HEAD -- ${file}`, { stdio: "inherit" });
        } catch (error) {
          this.ora.warn(`Unable to recover file: ${file}`);
        }
      }

      this.ora.succeed("Translation files recovered");
    }

    this.ora.start("Looking for new changes");

    const hasChanges = this.hasUncommittedChanges();
    if (hasChanges) {
      execSync("git add .", { stdio: "inherit" });
      execSync(
        `git commit -m "chore: update from ${this.provider.providerConfig.baseBranchName}"`,
        {
          stdio: "inherit",
        },
      );
      this.ora.succeed("New changes committed");
    } else {
      this.ora.succeed("No new changes found");
    }
  }

  private generatePullRequestDescription(): string {
    return `
Translation updates from [Languine](https://languine.ai) ready for review.

### What's New

I've synced all translations across our supported languages to ensure everything is up-to-date and consistent.

### Next Steps
1. Please review the changes to ensure they meet our quality standards
2. Merge when ready

Need to adjust settings? [Visit your Languine dashboard →](https://languine.ai/login)
    `.trim();
  }
}
