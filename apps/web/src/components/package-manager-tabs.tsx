"use client";

import { CopyButton } from "./copy-button";
import { usePackageManager } from "./package-manager-context";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export const COMMANDS = {
  install: {
    npm: "npm install",
    yarn: "yarn add",
    pnpm: "pnpm add",
    bun: "bun add",
  },
  dev: {
    npm: "npm install -D",
    yarn: "yarn add -D",
    pnpm: "pnpm add -D",
    bun: "bun add -D",
  },
  run: {
    npm: "npm run",
    yarn: "yarn",
    pnpm: "pnpm",
    bun: "bun",
  },
  exec: {
    npm: "npx",
    yarn: "yarn dlx",
    pnpm: "pnpm dlx",
    bun: "bunx",
  },
} as const;

export function PackageManagerTabs({
  code,
  type = "install",
  showCopy = true,
}: {
  code: string;
  type?: keyof typeof COMMANDS;
  showCopy?: boolean;
}) {
  const { packageManager, setPackageManager } = usePackageManager();

  const command = code.trim().replace(/^(npm|yarn|pnpm|bun)[\s]+/, "");
  const fullCommand = `${COMMANDS[type][packageManager]} ${command}`;

  const packageManagers: PackageManager[] = ["npm", "yarn", "pnpm", "bun"];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 -ml-2">
        {packageManagers.map((manager) => (
          <button
            key={manager}
            type="button"
            onClick={() => setPackageManager(manager)}
            className={`text-xs px-2 py-1 transition-colors ${
              packageManager === manager
                ? "underline text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {manager}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <pre className="font-mono text-sm">{fullCommand}</pre>
        {showCopy && <CopyButton code={fullCommand} />}
      </div>
    </div>
  );
}
