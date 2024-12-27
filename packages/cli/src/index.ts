#!/usr/bin/env node

import "./envs.js";
import { select } from "@clack/prompts";
import chalk from "chalk";
import dedent from "dedent";
import { clean } from "./commands/clean.js";
import { diff } from "./commands/diff.js";
import { init } from "./commands/init.js";
import { instructions } from "./commands/instructions.js";
import { translate } from "./commands/translate.js";

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
    Website: ${chalk.bold("https://languine.ai")}
  `),
);

console.log();

// Parse command line arguments
const command =
  process.argv[2] ||
  (await select({
    message: "What would you like to do?",
    options: [
      { value: "init", label: "Initialize a new Languine configuration" },
      { value: "translate", label: "Translate to target languages" },
      { value: "add", label: "Add a new language" },
      { value: "instructions", label: "Add custom translation instructions" },
      { value: "diff", label: "Check for changes in source locale file" },
      { value: "clean", label: "Clean unused translations" },
      { value: "available", label: "Available commands" },
    ],
  }));

const targetLocale = process.argv[3];
const preset = process.argv.includes("--preset")
  ? process.argv[process.argv.indexOf("--preset") + 1]
  : undefined;
const force = process.argv.includes("--force") || process.argv.includes("-f");

if (command === "init") {
  init(preset);
} else if (command === "translate") {
  translate(targetLocale, force);
} else if (command === "instructions") {
  instructions();
} else if (command === "diff") {
  diff();
} else if (command === "clean") {
  clean();
} else if (command === "available") {
  console.log(dedent`
    ${chalk.cyan("init")}          Initialize a new Languine configuration
    ${chalk.cyan("init")} ${chalk.gray("--preset expo")}    Initialize with Expo preset
    ${chalk.cyan("translate")}     Translate to all target locales
    ${chalk.cyan("translate")} ${chalk.gray("<locale>")}    Translate to a specific locale
    ${chalk.cyan("translate")} ${chalk.gray("--force")}     Force translate all keys
    ${chalk.cyan("instructions")}  Add custom translation instructions
    ${chalk.cyan("diff")}          Check for changes in source locale file
    ${chalk.cyan("clean")}         Clean unused translations
    ${chalk.cyan("available")}     Show available commands
    Run ${chalk.cyan("languine <command>")} to execute a command
  `);
}
