import { Tuning } from "@/components/tuning";
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

  return (
    <HydrateClient>
      <Tuning />
    </HydrateClient>
  );
}
