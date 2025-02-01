import { exec } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "./logger.ts";

export const execAsync = promisify(exec);

interface SpawnOptions
  extends Omit<Parameters<typeof Bun.spawn>[1], "throwOnError"> {
  /**
   * Whether to throw an error if the process exits with a non-zero code
   * @default true
   */
  throwOnError?: boolean;
}

/**
 * Runs a command using Bun's spawn API with better defaults and error handling
 */
export async function runCommand(
  command: string[],
  options: SpawnOptions = {},
) {
  const { throwOnError = true, ...spawnOptions } = options;

  logger.debug(`Running command: ${command.join(" ")}`);

  const proc = Bun.spawn(command, {
    stdout: "inherit",
    stderr: "inherit",
    ...spawnOptions,
  });

  const exitCode = await proc.exited;

  if (throwOnError && exitCode !== 0) {
    throw new Error(`Process failed with exit code ${exitCode}`);
  }

  return exitCode;
}
