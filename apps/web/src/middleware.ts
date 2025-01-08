import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";
import languineConfig from "../languine.config";
import { getDefaultOrganization } from "./db/queries/select";
import { getSessionFromRequest } from "./lib/auth/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: [...languineConfig.locale.targets, languineConfig.locale.source],
  defaultLocale: languineConfig.locale.source,
});

export async function middleware(request: NextRequest) {
  const i18nResponse = await I18nMiddleware(request);

  // Only proceed with organization check for login path
  if (request.nextUrl.pathname.includes("/login")) {
    const session = await getSessionFromRequest();

    if (!session?.user.id) {
      return i18nResponse;
    }

    const data = await getDefaultOrganization(session?.user.id);

    if (data?.organizations) {
      return NextResponse.redirect(
        new URL(`/${data.organizations.slug}/default`, request.url),
      );
    }
  }

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
