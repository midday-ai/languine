import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { setupAuth } from "./lib/auth";

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const auth = setupAuth(c);
  const headers = new Headers(c.req.raw.headers);

  // Try to get session from cookie first
  const session = await auth.api.getSession({ headers });

  if (session) {
    c.set("user", session.user);

    return next();
  }

  // Try user API key from Authorization header (Used in the CLI)
  const userApiKey = c.req.header("Authorization")?.replace("Bearer ", "");

  if (userApiKey) {
    const database = db(c.env.DB);
    const user = await database
      .select()
      .from(users)
      .where(eq(users.apiKey, userApiKey))
      .get();

    if (user) {
      c.set("user", user);

      return next();
    }
  }

  // If no valid session or API key, return unauthorized
  return c.json({ error: "Unauthorized" }, 401);
});
