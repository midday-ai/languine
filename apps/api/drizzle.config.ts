import fs from "node:fs";
import path from "node:path";
import type { Config } from "drizzle-kit";

const getLocalD1 = (): string => {
  const wranglerDir = path.resolve(".wrangler");

  try {
    const files = fs.readdirSync(wranglerDir, {
      encoding: "utf-8",
      recursive: true,
    });

    const dbFile = files.find((f) => f.endsWith(".sqlite"));

    if (!dbFile) {
      throw new Error(`No SQLite database found in ${wranglerDir}`);
    }

    return path.resolve(wranglerDir, dbFile);
  } catch {
    return path.resolve(wranglerDir, "default.sqlite");
  }
};

export default {
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  ...(!process.env.DEV_MODE
    ? {
        driver: "d1-http",
      }
    : {}),
  ...(process.env.DEV_MODE
    ? {
        dbCredentials: {
          url: getLocalD1(),
        },
      }
    : {}),
} satisfies Config;
