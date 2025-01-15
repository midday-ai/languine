import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const session = await getSession();

  if (!session?.data) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    if (token) {
      response.cookies.set("cli-token", token, {
        maxAge: 5 * 60,
      });
    }

    return response;
  }

  return NextResponse.json({ success: true });
}
