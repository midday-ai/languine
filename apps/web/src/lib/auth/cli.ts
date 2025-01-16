import { kv } from "@/lib/kv";
import type { Session } from "better-auth";
import { cookies } from "next/headers";

export const CLI_TOKEN_NAME = "cli-token";

export async function saveCLISession(session: Session, token: string) {
  await kv.set(`${CLI_TOKEN_NAME}:${token}`, session, {
    ex: 5 * 60,
  });
}

export async function getCLISession(token: string) {
  const data = await kv.get<Session>(`${CLI_TOKEN_NAME}:${token}`);

  return data;
}
