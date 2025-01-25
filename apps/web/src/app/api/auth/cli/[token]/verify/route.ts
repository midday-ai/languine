import { connectDb } from "@/db";
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

  const db = await connectDb();

  const user = await db.query.users.findFirst({
    where: eq(users.id, cliSession.user.id),
    columns: {
      id: true,
      name: true,
      email: true,
      apiKey: true,
    },
  });

  return NextResponse.json({
    success: true,
    user,
  });
}
