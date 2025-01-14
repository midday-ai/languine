import { authClient } from "@/lib/auth/client";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: opts.headers,
    },
  });

  return {
    user: session?.data?.user,
  };
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { user } = opts.ctx;

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      user,
    },
  });
});
