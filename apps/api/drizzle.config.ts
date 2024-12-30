import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  out: "drizzle",
  schema: "./src/db/schema.ts",
  // Only needed for drizzle studio
  //   dbCredentials: {
  //     accountId: Bun.env.DB_ACCOUNT_ID!,
  //     databaseId: Bun.env.DB_DATABASE_ID!,
  //     token: Bun.env.DB_TOKEN!,
  //   },
});
