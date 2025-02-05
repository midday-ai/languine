import fs from "node:fs/promises";
import path from "node:path";

const LOCK_FILES = [
  "bun.lockb",
  "bun.lock",
  "pnpm-lock.yaml",
  "yarn.lock",
  "package-lock.json",
] as const;

const WORKSPACE_FILES = [
  "pnpm-workspace.yaml",
  "lerna.json",
  "turbo.json",
  "nx.json",
] as const;

type PackageManager = {
  name: "npm" | "yarn" | "pnpm" | "bun";
  version: string;
};

async function preferredPM(pkgPath: string): Promise<PackageManager | null> {
  try {
    const files = await fs.readdir(pkgPath);

    if (files.includes("package-lock.json")) {
      return { name: "npm", version: ">=5" };
    }

    if (files.includes("yarn.lock")) {
      return { name: "yarn", version: "*" };
    }

    if (files.includes("pnpm-lock.yaml")) {
      return { name: "pnpm", version: ">=3" };
    }

    if (files.includes("bun.lockb") || files.includes("bun.lock")) {
      return { name: "bun", version: "*" };
    }

    return null;
  } catch {
    return null;
  }
}

async function isMonorepoRoot(dir: string): Promise<boolean> {
  try {
    // Check for common monorepo config files
    const files = await fs.readdir(dir);

    // Check for workspace config files
    if (WORKSPACE_FILES.some((file) => files.includes(file))) {
      return true;
    }

    // Check for lock files which often indicate root
    if (LOCK_FILES.some((file) => files.includes(file))) {
      // If we find a lock file, also verify it's not just a regular package by checking for workspaces
      try {
        const pkgPath = path.join(dir, "package.json");
        const pkgContent = await fs.readFile(pkgPath, "utf-8");
        const pkg = JSON.parse(pkgContent);
        return Boolean(pkg.workspaces);
      } catch {
        return false;
      }
    }

    // Check package.json for workspaces even if no lock file
    const pkgPath = path.join(dir, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);

    return Boolean(pkg.workspaces);
  } catch {
    return false;
  }
}

export async function findPreferredPM(): Promise<PackageManager | null> {
  let currentDir = process.cwd();
  let foundPM: PackageManager | null = { name: "npm", version: "*" };

  while (true) {
    // Store the first PM we find
    const pm = await preferredPM(currentDir);
    if (pm) foundPM = pm;

    // Check if we're at monorepo root
    if (await isMonorepoRoot(currentDir)) {
      return foundPM;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) return foundPM;

    currentDir = parentDir;
  }
}
