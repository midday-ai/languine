import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { organizationRouter } from "./organization";
import { projectRouter } from "./project";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  project: projectRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
