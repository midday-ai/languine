import type { auth } from "@/lib/auth";
import { betterFetch } from "@better-fetch/fetch";
import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";
import languineConfig from "../languine.config";

type Session = typeof auth.$Infer.Session;

const I18nMiddleware = createI18nMiddleware({
  locales: [...languineConfig.locale.targets, languineConfig.locale.source],
  defaultLocale: languineConfig.locale.source,
});

export async function middleware(request: NextRequest) {
  // const { data: session } = await betterFetch<Session>(
  //   "http://localhost:3002/api/auth/get-session",
  //   {
  //     baseURL: request.nextUrl.origin,
  //     headers: {
  //       cookie: request.headers.get("cookie") || "",
  //     },
  //   },
  // );

  // if (!session) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
