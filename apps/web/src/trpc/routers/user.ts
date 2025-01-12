import {
  deleteUser,
  getUserById,
  updateUser,
  updateUserApiKey,
} from "@/db/queries/user";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { rateLimitMiddleware } from "../middlewares/ratelimits";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return getUserById({ id: ctx.user.id });
  }),
  update: protectedProcedure
    .use(rateLimitMiddleware)
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return updateUser({ id: ctx.user.id, ...input });
    }),

  delete: protectedProcedure
    .use(rateLimitMiddleware)
    .mutation(async ({ ctx }) => {
      return deleteUser({ id: ctx.user.id });
    }),

  updateApiKey: protectedProcedure
    .use(rateLimitMiddleware)
    .mutation(async ({ ctx }) => {
      return updateUserApiKey(ctx.user.id);
    }),
});
