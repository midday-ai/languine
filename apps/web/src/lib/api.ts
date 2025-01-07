import type { AppType } from "@languine/api";
import { hc } from "hono/client";

export async function createClient() {
  return hc<AppType>(process.env.NEXT_PUBLIC_API_ENDPOINT!, {
    headers: {
      credentials: "include",
    },
  });
}
