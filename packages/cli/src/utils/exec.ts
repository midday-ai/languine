import { exec } from "node:child_process";

export async function execAsync(command: string) {
  return await new Promise<void>((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
