import type { AppType } from "@languine/api";
import { hc } from "hono/client";
import { cookies } from "next/headers";

export async function createClient() {
  const cookiesList = await cookies();
  const cookieHeader = cookiesList
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return hc<AppType>(process.env.NEXT_PUBLIC_API_ENDPOINT!, {
    headers: {
      cookie: cookieHeader,
    },
  });
}
