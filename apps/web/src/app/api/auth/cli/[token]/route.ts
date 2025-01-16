import { CLI_TOKEN_NAME, saveCLISession } from "@/lib/auth/cli";
import { getSession } from "@/lib/session";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60s"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { token } = await params;

  const session = await getSession();

  if (!session?.data) {
    const response = NextResponse.redirect(new URL("/login", request.url), {
      status: 302,
    });

    if (token) {
      response.cookies.set(CLI_TOKEN_NAME, token, {
        maxAge: 5 * 60,
      });
    }

    return response;
  }

  if (session?.data?.session) {
    await saveCLISession(session.data.session, token);
  }

  const response = NextResponse.redirect(new URL("/cli/success", request.url), {
    status: 302,
  });

  response.cookies.delete(CLI_TOKEN_NAME);

  return response;
}
