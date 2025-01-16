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
    return {
      DEBUG: process.env.DEBUG || false,
      BASE_URL: process.env.BASE_URL || "https://languine.ai",
    };
  }

  expand(env);

  return {
    DEBUG: process.env.DEBUG,
    BASE_URL: process.env.BASE_URL,
  };
}
