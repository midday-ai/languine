import { setupAuth } from "@/lib/auth";
import { createMiddleware } from "hono/factory";

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const auth = setupAuth(c);
  const headers = new Headers(c.req.raw.headers);
  const session = await auth.api.getSession({ headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return await next();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});
