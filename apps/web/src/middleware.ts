import { routing } from "@/i18n/routing";
import { updateSession } from "@languine/supabase/middleware";
import { getSession } from "@languine/supabase/session";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

const I18nMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = await updateSession(request, I18nMiddleware(request));

  // Only proceed with organization check for login path
  if (request.nextUrl.pathname.includes("/login")) {
    const inviteId = request.cookies.get("invite-id")?.value;

    const {
      data: { session },
    } = await getSession();

    if (!session?.user.id) {
      return response;
    }

    if (inviteId) {
      return NextResponse.redirect(new URL("/api/invite/accept", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
