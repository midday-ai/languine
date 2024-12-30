import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const db = (env: D1Database) => drizzle(env, { schema });
