import { loadEnv } from "@/utils/env.js";
import { getAPIKey } from "@/utils/session.js";
import type { AppRouter } from "@languine/web/src/trpc/routers/_app.js";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

loadEnv();

export const client = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: () => process.env.DEBUG === "true",
    }),
    httpBatchLink({
      url: `${process.env.BASE_URL}/api/trpc`,
      transformer: superjson,
      headers: () => {
        const apiKey = getAPIKey();

        return {
          "x-api-key": apiKey || undefined,
          "x-trpc-source": "cli",
        };
      },
    }),
  ],
});
