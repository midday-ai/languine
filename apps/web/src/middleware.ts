import { updateSession } from "@languine/supabase/middleware";
import { getSession } from "@languine/supabase/session";
import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";
import languineConfig from "../languine.config";

const I18nMiddleware = createI18nMiddleware({
  locales: [...languineConfig.locale.targets, languineConfig.locale.source],
  defaultLocale: languineConfig.locale.source,
  urlMappingStrategy: "rewriteDefault",
});

export async function middleware(request: NextRequest) {
  // @ts-ignore
  const response = await updateSession(request, I18nMiddleware(request));

  // Only proceed with organization check for login path
  if (request.nextUrl.pathname.includes("/login")) {
    const invitationId = request.cookies.get("invitationId")?.value;

    const {
      data: { session },
    } = await getSession();

    if (!session?.user.id) {
      return response;
    }

    if (invitationId) {
      return NextResponse.redirect(new URL("/api/invite/accept", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
