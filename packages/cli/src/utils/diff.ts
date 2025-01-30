import { readFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { createParser } from "@/parsers/index.ts";
import { simpleGit } from "simple-git";

interface DiffResult {
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
  valueChanges: Array<{
    key: string;
    oldValue: string;
    newValue: string;
  }>;
}

/**
 * Detects changes between the current state and a specified git ref (defaults to HEAD).
 * For untracked files, treats all keys as additions.
 * Also detects when source values change without key changes.
 * Returns an object containing arrays of added, removed and changed keys,
 * plus details about value changes.
 */
export async function getDiff({
  sourceFilePath,
  type,
  base,
}: {
  sourceFilePath: string;
  type: string;
  base?: string;
}): Promise<DiffResult> {
  // Initialize git in the repo root, not the file directory
  const git = simpleGit(process.cwd());
  const parser = createParser({ type });

  // Parse current file content
  const currentContent = readFileSync(sourceFilePath, "utf-8");
  const currentJson = await parser.parse(currentContent);
  const currentKeys = Object.keys(currentJson).sort();

  try {
    // Check if file is tracked by git
    const isTracked = await git.raw(["ls-files", sourceFilePath]);

    // If file is not tracked, treat all keys as additions
    if (!isTracked) {
      return {
        addedKeys: currentKeys,
        removedKeys: [],
        changedKeys: [],
        valueChanges: currentKeys.map((key) => ({
          key,
          oldValue: "",
          newValue: currentJson[key],
        })),
      };
    }

    // Get the path relative to the repo root, just like git diff uses
    const relativePath = relative(process.cwd(), sourceFilePath);
    const gitRef = base || "HEAD";

    if (process.env.DEV_MODE === "true") {
      console.log("Git ref:", gitRef);
      console.log("File path:", relativePath);
    }

    // Use git show with the path from repo root, just like git diff
    const content = await git.show([`${gitRef}:${relativePath}`]);
    const previousJson = await parser.parse(content);
    const previousKeys = Object.keys(previousJson).sort();

    // Create sets for more efficient lookups
    const currentKeysSet = new Set(currentKeys);
    const previousKeysSet = new Set(previousKeys);

    // Track value changes for existing keys
    const valueChanges = currentKeys
      .filter(
        (key) =>
          previousKeysSet.has(key) && currentJson[key] !== previousJson[key],
      )
      .map((key) => ({
        key,
        oldValue: previousJson[key],
        newValue: currentJson[key],
      }));

    return {
      // New keys that don't exist in HEAD
      addedKeys: currentKeys.filter((key) => !previousKeysSet.has(key)),
      // Keys that existed in HEAD but were removed
      removedKeys: previousKeys.filter((key) => !currentKeysSet.has(key)),
      // Keys that exist in both but have different values
      changedKeys: valueChanges.map((change) => change.key),
      // Detailed value changes
      valueChanges,
    };
  } catch (error) {
    if (process.env.DEV_MODE === "true") {
      console.error("Error getting diff:", error);
    }
    // If we can't get the previous version, throw the error
    throw error;
  }
}
