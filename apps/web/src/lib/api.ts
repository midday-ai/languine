import type { AppType } from "@languine/api";
import { hc } from "hono/client";
import { headers } from "next/headers";

export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_ENDPOINT!, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const headersList = await headers();
    return fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...init?.headers,
        cookie: headersList.get("cookie") ?? "",
      },
    });
  },
});
