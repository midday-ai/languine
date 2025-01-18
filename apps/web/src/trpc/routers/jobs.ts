import { auth } from "@trigger.dev/sdk/v3";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";

export const jobsRouter = createTRPCRouter({
  createPublicToken: protectedProcedure
    .use(rateLimitMiddleware)
    .mutation(async () => {
      const token = await auth.createPublicToken({
        expirationTime: "30min",
      });

      return token;
    }),
});
