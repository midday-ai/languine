import chalk from "chalk";
import { client } from "../../utils/api.ts";

export async function whoamiCommand() {
  const user = await client.user.me.query();

  const details = [
    ["Name", user.name],
    ["Email", user.email],
  ];

  console.log();
  console.log(chalk.bold("User Details"));
  console.log("- ".repeat(20));

  for (const [label, value] of details) {
    console.log(`${chalk.dim("•")} ${chalk.bold(label.padEnd(10))} ${value}`);
  }

  console.log("- ".repeat(20));
  console.log();
}
