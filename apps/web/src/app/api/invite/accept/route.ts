import { deleteInvitation } from "@/db/queries/organization";
import { acceptInvitation } from "@/lib/auth/queries";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const invitationId = cookieStore.get("invitationId")?.value;

  if (!invitationId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const invite = await acceptInvitation(invitationId);

    if (!invite) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Clear the invitation cookie
    cookieStore.delete("invitationId");

    await deleteInvitation(invitationId);

    // Redirect to organization dashboard if found
    if (invite.invitation.organizationId) {
      return NextResponse.redirect(
        new URL(`/${invite.invitation.organizationId}/default`, request.url),
      );
    }

    // Fallback redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
