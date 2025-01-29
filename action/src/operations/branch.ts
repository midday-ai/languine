import { execSync } from "node:child_process";
import path from "node:path";
import { BaseOperation, gitConfig } from "./core.js";

export class BranchOperation extends BaseOperation {
  async preRun() {
    this.ora.start("Setting up git configuration");
    const canContinue = this.setupGitEnvironment();
    this.ora.succeed("Git configuration complete");

    return canContinue;
  }

  async run(forcePush = false) {
    this.ora.start("Checking translations with Languine");
    await this.checkTranslations();
    this.ora.succeed("Translation check complete");

    this.ora.start("Looking for changes");
    const hasChanges = this.hasUncommittedChanges();
    this.ora.succeed(
      hasChanges ? "Found uncommitted changes" : "Everything is up to date",
    );

    if (hasChanges) {
      this.ora.start("Saving changes");

      execSync("git add .", { stdio: "inherit" });
      execSync(`git commit -m "${this.provider.config.commitMessage}"`, {
        stdio: "inherit",
      });

      this.ora.succeed("Changes saved");

      this.ora.start("Syncing with remote repository");
      const currentBranch =
        this.translationBranchName ??
        this.provider.providerConfig.baseBranchName;

      execSync(
        `git push origin ${currentBranch} ${forcePush ? "--force" : ""}`,
        {
          stdio: "inherit",
        },
      );

      this.ora.succeed("Remote repository updated");
    }

    return hasChanges;
  }

  protected hasUncommittedChanges() {
    return (
      execSync('git status --porcelain || echo "has_changes"', {
        encoding: "utf8",
      }).length > 0
    );
  }

  private async checkTranslations() {
    execSync(`bunx languine@${this.provider.config.version} check`, {
      stdio: "inherit",
    });
  }

  private setupGitEnvironment() {
    const { baseBranchName } = this.provider.providerConfig;

    this.ora.info("Verifying working directory:");
    execSync("pwd", { stdio: "inherit" });
    execSync("ls -la", { stdio: "inherit" });

    execSync(`git config --global safe.directory ${process.cwd()}`);

    execSync(`git config user.name "${gitConfig.userName}"`);
    execSync(`git config user.email "${gitConfig.userEmail}"`);

    execSync(`git fetch origin ${baseBranchName}`, { stdio: "inherit" });
    execSync(`git checkout ${baseBranchName} --`, { stdio: "inherit" });

    const currentAuthor = `${gitConfig.userName} <${gitConfig.userEmail}>`;
    const authorOfLastCommit = execSync(
      `git log -1 --pretty=format:'%an <%ae>'`,
    ).toString();
    if (authorOfLastCommit === currentAuthor) {
      this.ora.fail(`Cannot process commits made by ${currentAuthor}`);
      return false;
    }

    this.provider?.gitConfig();

    const workingDir = path.resolve(
      process.cwd(),
      this.provider.config.workingDir,
    );
    if (workingDir !== process.cwd()) {
      this.ora.info(
        `Switching to working directory: ${this.provider.config.workingDir}`,
      );
      process.chdir(workingDir);
    }

    return true;
  }
}
