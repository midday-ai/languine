import { exec, execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { confirm, outro, text } from "@clack/prompts";
import chalk from "chalk";
import dedent from "dedent";
import type { Jiti } from "jiti";
import preferredPM from "preferred-pm";
import type { Config } from "./types.js";

const CONFIG_NAME = "languine.config";

export async function getApiKey(name: string, key: string) {
  if (key in process.env) {
    return process.env[key];
  }
  return (async () => {
    let apiKey: string | symbol;
    do {
      apiKey = await text({
        message: dedent`
          ${chalk.bold(`Please provide your ${name} API key.`)}

          To skip this message, set ${chalk.bold(key)} env variable, and run again. 
          
          You can do it in three ways:
          - by creating an ${chalk.bold(".env.local")} file (make sure to ${chalk.bold(".gitignore")} it)
            ${chalk.gray(`\`\`\`
              ${key}=<your-key>
              \`\`\`
            `)}
          - by passing it inline:
            ${chalk.gray(`\`\`\`
              ${key}=<your-key> npx languine
              \`\`\`
            `)}
          - by setting it as an env variable in your shell (e.g. in ~/.zshrc or ~/.bashrc):
            ${chalk.gray(`\`\`\`
              export ${key}=<your-key>
              \`\`\`
            `)},
          `,
        validate: (value) =>
          value.length > 0 ? undefined : `Please provide a valid ${key}.`,
      });
    } while (typeof apiKey === "undefined");

    if (typeof apiKey === "symbol") {
      outro(chalk.gray("Bye!"));
      process.exit(0);
    }

    const save = await confirm({
      message: "Do you want to save it for future runs in .env.local?",
    });

    if (save) {
      execSync(`echo "${key}=${apiKey}" >> .env.local`);
      execSync(`echo ".env.local" >> .gitignore`);
    }

    return apiKey;
  })();
}

export function generateConfig({
  version,
  sourceLanguage,
  targetLanguages,
  fileFormat,
  filesPatterns,
  provider,
  model,
  configType,
}: {
  version: string;
  sourceLanguage: string;
  targetLanguages: string[];
  fileFormat: string;
  filesPatterns: string[];
  provider: string;
  model: string;
  configType: string;
}) {
  const formatKey = fileFormat.includes("-") ? `"${fileFormat}"` : fileFormat;

  const configBody = `{
  version: "${version}",
  locale: {
    source: "${sourceLanguage}",
    targets: [${targetLanguages.map((l) => `"${l}"`).join(", ")}],
  },
  files: {
    ${formatKey}: {
      include: [${filesPatterns.map((p) => `"${p}"`).join(", ")}],
    },
  },
  llm: {
    provider: "${provider}",
    model: "${model}",
  },
}`;

  if (configType === "mjs") {
    return `export default ${configBody};`;
  }

  return `import { defineConfig } from "languine";

export default defineConfig(${configBody});`;
}

export async function configFile(configType?: string) {
  const files = await fs.readdir(process.cwd());
  const configFile = files.find(
    (file: string) =>
      file.startsWith(`${CONFIG_NAME}.`) &&
      (file.endsWith(".ts") || file.endsWith(".mjs")),
  );

  // If configType is specified, use that
  // Otherwise try to detect from existing file, falling back to ts
  const format = configType || (configFile?.endsWith(".mjs") ? "mjs" : "ts");
  const filePath = path.join(
    process.cwd(),
    configFile || `${CONFIG_NAME}.${format}`,
  );

  return {
    path: filePath,
    format,
  };
}

let jiti: Jiti | undefined;

export async function getConfig(): Promise<Config> {
  const { path: filePath, format } = await configFile();

  if (!filePath) {
    outro(
      chalk.red(
        `Could not find ${CONFIG_NAME}.${format}. Run 'languine init' first.`,
      ),
    );

    process.exit(1);
  }

  try {
    const configModule = await import(pathToFileURL(filePath).href);
    return configModule.default;
  } catch (error) {
    const { createJiti } = await import("jiti");
    const { transform } = await import("sucrase");

    jiti ??= createJiti(import.meta.url, {
      transform(opts) {
        return transform(opts.source, {
          transforms: ["typescript", "imports"],
        });
      },
    });

    return await jiti
      .import(filePath)
      .then((mod) => (mod as unknown as { default: Config }).default);
  }
}

export async function execAsync(command: string) {
  return await new Promise<void>((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

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
