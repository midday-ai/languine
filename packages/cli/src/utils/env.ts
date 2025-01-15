import path from "node:path";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

/**
 * Loads environment variables from .env file in the current working directory
 * Falls back to default values if no .env file exists
 */
export function loadEnv() {
  // Try to load .env file
  const env = config({
    path: path.resolve(process.cwd(), ".env"),
  });

  if (env.error) {
    // Set default values if .env doesn't exist
    process.env.BASE_URL = process.env.BASE_URL || "https://languine.ai";

    return;
  }

  expand(env);
}
