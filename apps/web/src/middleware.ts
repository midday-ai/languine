import { createI18nMiddleware } from "next-international/middleware";
import type { NextRequest } from "next/server";
import languineConfig from "../languine.config";

console.log(languineConfig.locale);

const I18nMiddleware = createI18nMiddleware({
  locales: languineConfig.locale.targets,
  defaultLocale: languineConfig.locale.source,
  urlMappingStrategy: "rewrite",
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
