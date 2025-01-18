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

  expand(env);

  return {
    DEBUG: env.parsed?.DEBUG || false,
    BASE_URL: env.parsed?.BASE_URL || "https://languine.ai",
    LANGUINE_PROJECT_ID: env.parsed?.LANGUINE_PROJECT_ID,
  };
}
