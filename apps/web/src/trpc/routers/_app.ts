import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { organizationRouter } from "./organization";

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
