import { getUserById, updateUser } from "@/db/queries/user";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    return getUserById({ id: ctx.user.id });
  }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return updateUser({ id: ctx.user.id, ...input });
    }),
});
