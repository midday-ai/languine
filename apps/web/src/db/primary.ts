import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const primaryDb = drizzle(
  postgres(process.env.DATABASE_PRIMARY_URL!, { prepare: false }),
  { schema },
);
