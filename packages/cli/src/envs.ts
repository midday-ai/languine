import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Try to find root directory by looking for package.json with workspaces
function findMonorepoRoot(dir: string): string {
  const pkgPath = path.join(dir, "package.json");

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.workspaces) {
      return dir;
    }
  }

  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    return process.cwd(); // Reached root, fallback to cwd
  }

  return findMonorepoRoot(parentDir);
}

const rootDir = findMonorepoRoot(process.cwd());
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config(); // Fallback to current directory
