import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { debug } from "./debug.js";

// Try to find root directory by looking for package.json with workspaces
function findMonorepoRoot(dir: string): string {
  debug(`Looking for monorepo root in ${dir}`);
  const pkgPath = path.join(dir, "package.json");

  if (fs.existsSync(pkgPath)) {
    debug(`Found package.json at ${pkgPath}`);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.workspaces) {
      debug(`Found workspaces in package.json, using ${dir} as root`);
      return dir;
    }
  }

  const parentDir = path.dirname(dir);
  if (parentDir === dir) {
    debug(`Reached filesystem root, falling back to cwd: ${process.cwd()}`);
    return process.cwd(); // Reached root, fallback to cwd
  }

  return findMonorepoRoot(parentDir);
}

const rootDir = findMonorepoRoot(process.cwd());
debug(`Loading .env from ${rootDir}`);
dotenv.config({ path: path.join(rootDir, ".env") });
debug("Loading .env from current directory as fallback");
dotenv.config(); // Fallback to current directory
