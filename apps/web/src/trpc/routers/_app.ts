import type { inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { analyticsRouter } from "./analytics";
import { jobsRouter } from "./jobs";
import { organizationRouter } from "./organization";
import { projectRouter } from "./project";
import { translateRouter } from "./translate";
import { userRouter } from "./user";

export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  project: projectRouter,
  user: userRouter,
  translate: translateRouter,
  analytics: analyticsRouter,
  jobs: jobsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
