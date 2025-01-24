import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { type AppRouter, appRouter } from "./routers/_app";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = await headers();
  const headersObject = new Headers();

  for (const [key, value] of Array.from(heads.entries())) {
    headersObject.set(key, value);
  }

  headersObject.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: headersObject,
  });
});

export const getQueryClient = cache(makeQueryClient);

const caller = createCallerFactory(appRouter)(createContext);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
