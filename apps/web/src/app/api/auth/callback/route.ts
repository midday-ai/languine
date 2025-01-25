import { createClient } from "@languine/supabase/server";
import { setSkipSessionRefreshCookie } from "@languine/supabase/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/login";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      const response = isLocalEnv
        ? NextResponse.redirect(`${origin}${next}`)
        : forwardedHost
          ? NextResponse.redirect(`https://${forwardedHost}${next}`)
          : NextResponse.redirect(`${origin}${next}`);

      // Set cookie to avoid checking remote session for 30 minutes
      setSkipSessionRefreshCookie(response, true);

      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=code_exchange_failed`);
}
