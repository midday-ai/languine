import { db } from "@/db";
import { users } from "@/db/schema";
import { getCLISession } from "@/lib/auth/cli";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const cliSession = await getCLISession(token);

  if (!cliSession) {
    return NextResponse.json(
      {
        success: false,
      },
      { status: 404 },
    );
  }

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      apiKey: users.apiKey,
    })
    .from(users)
    .where(eq(users.id, cliSession.userId))
    .get();

  return NextResponse.json({
    success: true,
    user,
  });
}
