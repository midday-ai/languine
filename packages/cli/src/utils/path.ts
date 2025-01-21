import { relative } from "node:path";

/**
 * Transforms a source file path to a target locale path.
 * Handles different patterns of locale placement in paths.
 *
 * @param sourcePath - The original file path
 * @param sourceLocale - The source locale code
 * @param targetLocale - The target locale code
 * @param workspacePath - The absolute path to the workspace root
 * @returns The transformed path with the target locale
 *
 * @example
 * // Basic directory structure
 * transformLocalePath('/workspace/content/docs/en/test.mdx', 'en', 'fr', '/workspace')
 * // => 'content/docs/fr/test.mdx'
 *
 * // Locale in filename
 * transformLocalePath('/workspace/content/ui.en.json', 'en', 'fr', '/workspace')
 * // => 'content/ui.fr.json'
 */
export function transformLocalePath(
  sourcePath: string,
  sourceLocale: string,
  targetLocale: string,
  workspacePath: string,
): string {
  // Convert absolute path to relative workspace path
  const relativePath = relative(workspacePath, sourcePath);

  // If source locale is empty, this is a source file without locale suffix
  if (!sourceLocale) {
    // Insert target locale before the last extension
    const lastDotIndex = relativePath.lastIndexOf(".");
    if (lastDotIndex === -1) return relativePath;
    return `${relativePath.slice(0, lastDotIndex)}.${targetLocale}${relativePath.slice(lastDotIndex)}`;
  }

  // Find and replace the last occurrence of the locale in the path
  const pattern = new RegExp(
    `(?<=[/.])(${sourceLocale})(?=[./])(?!.*(?<=[/.])(${sourceLocale})(?=[./]))`,
  );
  return relativePath.replace(pattern, targetLocale);
}
