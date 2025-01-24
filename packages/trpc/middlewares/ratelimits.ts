import { kv } from "@/lib/kv";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { t } from "../init";

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export const rateLimitMiddleware = t.middleware(async ({ ctx, next, path }) => {
  if (!ctx.authenticatedId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const identifier = `${ctx.authenticatedId}:${path}`;

  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    });
  }

  return next();
});
