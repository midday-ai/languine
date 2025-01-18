#!/usr/bin/env node

import chalk from "chalk";
import dedent from "dedent";
import updater from "tiny-updater";
import pkg from "../package.json" assert { type: "json" };
import { runCommands } from "./commands/run.js";
import { loadEnv } from "./utils/env.js";

await updater({
  name: pkg.name,
  version: pkg.version,
  ttl: 86_400_000,
});

loadEnv();

if (!process.argv[2]) {
  console.log(
    `
    ██╗      █████╗ ███╗   ██╗ ██████╗ ██╗   ██╗██╗███╗   ██╗███████╗
    ██║     ██╔══██╗████╗  ██║██╔════╝ ██║   ██║██║████╗  ██║██╔════╝
    ██║     ███████║██╔██╗ ██║██║  ███╗██║   ██║██║██║██╗ ██║█████╗  
    ██║     ██╔══██║██║╚██╗██║██║   ██║██║   ██║██║██║╚██╗██║██╔══╝  
    ███████╗██║  ██║██║ ╚████║╚██████╔╝╚██████╔╝██║██║ ╚████║███████╗
    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
    `,
  );

  console.log(
    chalk.gray(dedent`
      Translate your application with Languine CLI powered by AI.
      Website: ${chalk.bold(process.env.BASE_URL)}
    `),
  );

  console.log();
}

await runCommands();
