import path from "node:path";
import preferredPM from "preferred-pm";

export async function findPreferredPM() {
  let currentDir = process.cwd();

  while (true) {
    const pm = await preferredPM(currentDir);
    if (pm) return pm;

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) return null;

    // Look for package.json to determine if we're at project root
    try {
      await import(path.join(currentDir, "package.json"));
      // If we find package.json, this is as far as we should go
      return null;
    } catch {
      currentDir = parentDir;
    }
  }
}
