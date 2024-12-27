import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { confirm, outro, text } from "@clack/prompts";
import chalk from "chalk";
import dedent from "dedent";
import type { Jiti } from "jiti";
import type { Config } from "./types.js";

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

export const configPath = path.join(process.cwd(), "languine.config.ts");
const name = "languine.config";

let jiti: Jiti | undefined;

export async function getConfig(): Promise<Config> {
  let config: Config;
  let target: string | undefined;
  const files = await fs.readdir(process.cwd());

  for (const file of files) {
    if (file.startsWith(`${name}.`)) {
      target = path.resolve(file);
      break;
    }
  }

  if (!target) {
    outro(
      chalk.red(
        "Could not find languine.config.ts. Run 'languine init' first.",
      ),
    );

    process.exit(1);
  }

  try {
    const configModule = await import(pathToFileURL(target).href);
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

    return await jiti.import(target).then((mod) => (mod as any).default);
  }
}
