import WelcomeEmail from "@/emails/templates/welcome";
import { resend } from "@/lib/resend";
import { UTCDate } from "@date-fns/utc";
import { createClient } from "@languine/supabase/server";
import { getSession } from "@languine/supabase/session";
import { setSkipSessionRefreshCookie } from "@languine/supabase/utils";
import { differenceInSeconds } from "date-fns";
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

      const {
        data: { session },
      } = await getSession();

      // Send welcome email if user was created in the last 10 seconds
      if (
        session?.user.created_at &&
        differenceInSeconds(
          new UTCDate(),
          new UTCDate(session.user.created_at),
        ) < 10
      ) {
        try {
          await resend.emails.send({
            from: "Languine <hello@emails.languine.ai>",
            to: session.user.email!,
            subject: "Welcome to Languine",
            react: WelcomeEmail({
              name: session.user.user_metadata.full_name,
            }),
          });
        } catch (error) {
          console.error("Error sending welcome email", error);
        }
      }

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
