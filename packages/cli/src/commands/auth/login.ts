import { randomUUID } from "node:crypto";
import { loadEnv } from "@/utils/env.ts";
import { saveSession } from "@/utils/session.ts";
import { intro, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import open from "open";

const { BASE_URL } = loadEnv();

export async function loginCommand() {
  intro("Login to Languine");

  const loginId = randomUUID();
  const loginUrl = `${BASE_URL}/api/auth/cli/${loginId}`;

  const s = spinner();

  try {
    await open(loginUrl);
  } catch (error) {
    s.stop("Could not open browser automatically");
  }

  console.log();
  console.log(
    chalk.gray(
      "If the browser didn't open automatically, please visit this URL:",
    ),
  );
  console.log(chalk.bold(loginUrl));
  console.log();

  s.start("Waiting for authentication...");

  for (let i = 0; i < 20; i++) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/cli/${loginId}/verify`,
      );
      const data = await response.json();

      if (data.success) {
        s.stop("Successfully authenticated!");
        outro("You are now logged in");

        saveSession(data.user);
        return;
      }
    } catch (error) {
      // Ignore errors and continue polling
    }

    // Wait 3 seconds before next attempt
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  s.stop("Authentication timed out");
  outro("Please try logging in again");
  return;
}
