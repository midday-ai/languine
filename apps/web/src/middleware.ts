import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";
import languineConfig from "../languine.config";
import { getProjectByOrganizationId } from "./db/queries/project";
import { getSessionFromRequest } from "./lib/auth/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: [...languineConfig.locale.targets, languineConfig.locale.source],
  defaultLocale: languineConfig.locale.source,
});

export async function middleware(request: NextRequest) {
  const i18nResponse = await I18nMiddleware(request);

  // Only proceed with organization check for login path
  if (request.nextUrl.pathname.includes("/login")) {
    const data = await getSessionFromRequest();

    if (!data?.user.id) {
      return i18nResponse;
    }

    if (data.session?.activeOrganizationId) {
      const project = await getProjectByOrganizationId({
        organizationId: data.session.activeOrganizationId,
      });

      return NextResponse.redirect(
        new URL(
          `/${data.session.activeOrganizationId}/${project?.slug || "default"}`,
          request.url,
        ),
      );
    }
  }

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
