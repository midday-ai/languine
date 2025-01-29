import { execSync } from "node:child_process";
import { Octokit } from "octokit";
import createOra from "ora";
import { CONFIG_SCHEMA } from "./config.js";

async function main() {
  const spinner = createOra();

  try {
    const config = CONFIG_SCHEMA.parse(process.env);
    const octokit = new Octokit({ auth: config.GITHUB_TOKEN });

    spinner.start("Checking for translation updates");

    execSync(
      `npx @languine/cli@${config.LANGUINE_VERSION} translate --api-key ${config.LANGUINE_API_KEY} --projectId ${config.LANGUINE_PROJECT_ID}`,
      {
        stdio: "inherit",
      },
    );

    const hasChanges =
      execSync("git status --porcelain").toString().trim().length > 0;

    if (!hasChanges) {
      spinner.succeed("All translations are up to date");
      return;
    }

    // Commit changes
    execSync("git config --global user.name 'Languine Bot'");
    execSync("git config --global user.email 'bot@languine.ai'");
    execSync("git add .");
    execSync("git commit -m 'chore(i18n): update translations'");

    // Create or update PR
    const branchName = "languine/translation-updates";
    execSync(`git checkout -b ${branchName}`);
    execSync(`git push -u origin ${branchName} --force`);

    // Check for existing PR
    const { data: existingPRs } = await octokit.rest.pulls.list({
      owner: config.GITHUB_REPOSITORY_OWNER,
      repo: config.GITHUB_REPOSITORY.split("/")[1],
      head: `${config.GITHUB_REPOSITORY_OWNER}:${branchName}`,
      state: "open",
    });

    if (existingPRs.length === 0) {
      await octokit.rest.pulls.create({
        owner: config.GITHUB_REPOSITORY_OWNER,
        repo: config.GITHUB_REPOSITORY.split("/")[1],
        title: "chore(i18n): update translations",
        head: branchName,
        base: "main",
        body: "This pull request updates translations via Languine. Please review the changes and merge if everything looks correct.",
      });

      spinner.succeed("Created new pull request with translation updates");
    } else {
      spinner.succeed("Updated existing translation pull request");
    }
  } catch (error: unknown) {
    spinner.fail(
      `Failed to process translations: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

main();
