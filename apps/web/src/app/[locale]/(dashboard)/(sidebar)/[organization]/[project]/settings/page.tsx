import { Settings } from "@/components/settings";
import { HydrateClient, trpc } from "@/trpc/server";

export default async function Page({
  params,
}: {
  params: Promise<{ organization: string; project: string }>;
}) {
  const { organization, project } = await params;

  trpc.project.getBySlug.prefetch({
    slug: project,
    organizationId: organization,
  });

  trpc.user.me.prefetch();

  trpc.organization.getById.prefetch({
    organizationId: organization,
  });

  return (
    <HydrateClient>
      <Settings />
    </HydrateClient>
  );
}
