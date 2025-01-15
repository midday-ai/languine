import { select } from "@clack/prompts";

export async function commands() {
  const command = await select({
    message: "What would you like to do?",
    options: [
      { value: "init", label: "Initialize a new Languine configuration" },
      { value: "auth", label: "Manage authentication" },
    ],
  });

  return command;
}
