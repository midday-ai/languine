import { acceptInvitation } from "@/lib/auth/queries";
import { getSession } from "@/lib/session";
import { trpc } from "@/trpc/server";
import { redirect } from "next/navigation";

/**
 * Page component for handling team invitations
 *
 * Flow:
 * 1. Validates invitation ID exists
 * 2. Checks if user is logged in, redirects to login if not
 * 3. Accepts the invitation
 * 4. Redirects to organization dashboard if successful
 */
export default async function Page({
  params,
}: {
  params: { invitationId: string };
}) {
  const { invitationId } = await params;

  // Validate invitation ID exists
  if (!invitationId) {
    redirect("/login");
  }

  // Check if user is logged in
  const session = await getSession();

  if (!session) {
    // Redirect to login with return URL to invitation page
    redirect(
      `/login?redirect=${encodeURIComponent(`/invite/${invitationId}`)}`,
    );
  }

  // Accept the invitation
  const invite = await acceptInvitation(invitationId);

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
}
