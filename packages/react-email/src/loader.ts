import fs from "node:fs";
import path from "node:path";

const translations: Record<string, Record<string, string>> = {};

/**
 * Recursively searches up directory tree for package.json
 */
const findPackageRoot = (dir: string): string => {
  if (fs.existsSync(path.join(dir, "package.json"))) {
    return dir;
  }

  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    throw new Error("Could not find package.json in directory tree");
  }

  return findPackageRoot(parentDir);
};

/**
 * Recursively loads all JSON translation files from locales directory
 */
const loadTranslations = (dir: string, baseDir: string) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadTranslations(fullPath, baseDir);
      continue;
    }

    if (!file.endsWith(".json")) {
      continue;
    }

    const relativePath = path.relative(baseDir, fullPath);
    const locale = path.basename(relativePath, ".json");
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      translations[locale] = JSON.parse(content);
    } catch (err) {
      throw new Error(
        `Failed to load translation file ${fullPath}: ${
          (err as Error).message
        }`,
      );
    }
  }
};

// Load translations from locales directory in package root
const packageRoot = findPackageRoot(__dirname);
const localesDir = path.join(packageRoot, "locales");

if (!fs.existsSync(localesDir)) {
  throw new Error("No locales directory found in package root");
}

loadTranslations(localesDir, localesDir);

export { translations };
