import type { AppType } from "@languine/api";
import { hc } from "hono/client";
import { getCookieHeaders } from "./cookies";

export const api = hc<AppType>(process.env.NEXT_PUBLIC_API_ENDPOINT!, {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestHeaders = await getCookieHeaders();

    return fetch(input, {
      ...init,
      credentials: "include",
      headers: {
        ...init?.headers,
        ...requestHeaders,
      },
    });
  },
});
