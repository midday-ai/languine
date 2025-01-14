import { Activity, ActivitySkeleton } from "@/components/activity";
import {
  AnalyticsChart,
  AnalyticsChartSkeleton,
} from "@/components/charts/analytics";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ organization: string; project: string }>;
}) {
  const { organization, project } = await params;

  trpc.analytics.getProjectStats.prefetch({
    projectSlug: project,
    organizationId: organization,
  });

  trpc.translate.getTranslationsBySlug.prefetchInfinite({
    slug: project,
    organizationId: organization,
  });

  return (
    <HydrateClient>
      <Suspense fallback={<AnalyticsChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>

      <div className="h-10 mt-10 w-full bg-dotted" />

      <Suspense fallback={<ActivitySkeleton />}>
        <Activity />
      </Suspense>
    </HydrateClient>
  );
}
