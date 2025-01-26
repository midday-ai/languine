import type { NextResponse } from "next/server";

export const SKIP_SESSION_REFRESH_COOKIE = "skip-session-refresh";

export function setSkipSessionRefreshCookie(
  response: NextResponse,
  value: boolean,
) {
  response.cookies.set({
    name: SKIP_SESSION_REFRESH_COOKIE,
    value: value ? "true" : "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: value ? 30 * 60 : 0,
  });
}
