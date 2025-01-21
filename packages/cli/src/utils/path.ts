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

  // Split the path into segments
  const segments = relativePath.split("/");
  const filename = segments[segments.length - 1];

  // Check if locale is in the filename
  if (filename.includes(`.${sourceLocale}.`)) {
    return relativePath.replace(
      new RegExp(`\\.${sourceLocale}\\.`),
      `.${targetLocale}.`,
    );
  }

  // Find the last occurrence of the source locale in the directory structure
  const localeIndex = segments.lastIndexOf(sourceLocale);
  if (localeIndex !== -1) {
    segments[localeIndex] = targetLocale;
    return segments.join("/");
  }

  // If no locale found, return the original path
  return relativePath;
}
