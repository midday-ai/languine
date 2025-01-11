import { acceptInvitation } from "@/lib/auth/queries";
import { getSession } from "@/lib/session";
import { trpc } from "@/trpc/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(
  _: Request,
  { params }: { params: { inviteId: string } },
) {
  try {
    const { inviteId } = params;

    // Check if user is logged in
    const session = await getSession();
    const cookieStore = await cookies();

    if (!session?.data) {
      // Set invitation cookie before redirecting
      cookieStore.set("invitationId", inviteId);
      redirect("/login");
    }

    const invite = await acceptInvitation(inviteId);

    if (!invite) {
      redirect("/login");
    }

    // Get organization details
    const organization = await trpc.organization.getById({
      organizationId: invite.invitation.organizationId,
    });

    // Redirect to organization dashboard if found
    if (organization) {
      redirect(`/${organization.slug}/default`);
    }

    // Fallback redirect to login
    redirect("/login");
  } catch (error) {
    redirect("/login");
  }
}
