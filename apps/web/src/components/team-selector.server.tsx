import { Skeleton } from "@/components/ui/skeleton";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { TeamSelector } from "./team-selector";

export async function TeamSelectorServer() {
  trpc.organization.getAll.prefetch();

  return (
    <HydrateClient>
      <Suspense fallback={<Skeleton className="h-5 w-[260px]" />}>
        <TeamSelector />
      </Suspense>
    </HydrateClient>
  );
}
