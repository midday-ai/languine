import { getSession } from "@/lib/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { token: string } },
) {
  // const cookieStore = await cookies();
  const session = await getSession();

  if (!session?.data) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (params.token) {
      response.cookies.set("cli-token", params.token, {
        maxAge: 5 * 60, // 5 minutes in seconds
      });
    }

    return response;
  }

  return NextResponse.json({ success: true });
}
