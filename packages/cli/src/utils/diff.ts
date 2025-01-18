import { readFileSync } from "node:fs";
import { type ParserType, createParser } from "@/parsers/index.ts";
import { simpleGit } from "simple-git";

/**
 * Detects changes between the current state and the last committed version of a file in git,
 * optionally considering a base branch.
 */
export async function getDiff({
  sourceFilePath,
  type,
  baseBranch,
}: {
  sourceFilePath: string;
  type: ParserType;
  baseBranch?: string; // The branch or commit to compare against
}) {
  const git = simpleGit();
  const parser = createParser({ type });

  // Get default branch if none specified
  if (!baseBranch) {
    try {
      baseBranch = await git
        .raw(["symbolic-ref", "--short", "refs/remotes/origin/HEAD"])
        .then((output) => output.trim().replace("origin/", ""));
    } catch (error) {
      // Fallback to main if HEAD ref doesn't exist
      baseBranch = "main";
    }
  }

  // Parse current file content
  const currentContent = readFileSync(sourceFilePath, "utf-8");
  const currentJson = await parser.parse(currentContent);
  const currentKeys = Object.keys(currentJson);

  let previousKeys: string[] = [];
  let isTrackedInBranch = false;

  try {
    // Check if the file exists in the specified base branch
    isTrackedInBranch = await git
      .raw(["ls-tree", "-r", baseBranch, "--name-only", sourceFilePath])
      .then((output) => Boolean(output.trim()))
      .catch(() => false);

    if (isTrackedInBranch) {
      // File exists in the base branch, get its previous content
      const previousContent = await git.show([
        `${baseBranch}:${sourceFilePath}`,
      ]);
      const previousJson = await parser.parse(previousContent);
      previousKeys = Object.keys(previousJson);
    } else {
      // Fallback: File is new in this branch
      console.log(`File ${sourceFilePath} does not exist in ${baseBranch}.`);
    }

    // Handle unstaged changes using git diff
    const diff = await git.diff([sourceFilePath]);
    const addedKeys: string[] = [];

    if (diff) {
      const addedContent = diff
        .split("\n")
        .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
        .map((line) => line.substring(1))
        .join("\n");

      if (addedContent) {
        const addedJson = await parser.parse(addedContent);
        addedKeys.push(...Object.keys(addedJson));
      }
    }

    return {
      // New keys that don't exist in the previous version
      addedKeys: [
        ...currentKeys.filter((key) => !previousKeys.includes(key)),
        ...addedKeys,
      ],

      // Keys that existed before but were removed
      removedKeys: previousKeys.filter((key) => !currentKeys.includes(key)),

      // Keys that exist in both but have different values
      changedKeys: currentKeys.filter(
        (key) =>
          previousKeys.includes(key) && currentJson[key] !== previousKeys[key],
      ),
    };
  } catch (error) {
    console.error("Error detecting changes using git:", error);
    throw error;
  }
}
