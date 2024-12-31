import { setupAuth } from "@/lib/auth";
import type { Context, Next } from "hono";

export const sessionMiddleware = async (c: Context, next: Next) => {
  const auth = setupAuth(c);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
};
