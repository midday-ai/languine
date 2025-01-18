import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { createParser } from "@/parsers/index.ts";
import { simpleGit } from "simple-git";

interface DiffResult {
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
}

/**
 * Detects changes between the current state and HEAD.
 * Returns an object containing arrays of added, removed and changed keys.
 */
export async function getDiff({
  sourceFilePath,
  type,
}: {
  sourceFilePath: string;
  type: string;
}): Promise<DiffResult> {
  const git = simpleGit();
  const parser = createParser({ type });

  // Get relative path from current working directory
  const relativePath = relative(process.cwd(), resolve(sourceFilePath));

  // Parse current file content
  const currentContent = readFileSync(sourceFilePath, "utf-8");
  const currentJson = await parser.parse(currentContent);
  const currentKeys = Object.keys(currentJson);

  try {
    // Get and parse previous version from git HEAD
    const content = await git.show([`HEAD:./${relativePath}`]);
    const previousJson = await parser.parse(content);
    const previousKeys = Object.keys(previousJson);

    // Create sets for more efficient lookups
    const currentKeysSet = new Set(currentKeys);
    const previousKeysSet = new Set(previousKeys);

    return {
      // New keys that don't exist in HEAD
      addedKeys: currentKeys.filter((key) => !previousKeysSet.has(key)),

      // Keys that existed in HEAD but were removed
      removedKeys: previousKeys.filter((key) => !currentKeysSet.has(key)),

      // Keys that exist in both but have different values
      changedKeys: currentKeys.filter(
        (key) =>
          previousKeysSet.has(key) && currentJson[key] !== previousJson[key],
      ),
    };
  } catch (error) {
    throw new Error(
      `Failed to detect changes: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
