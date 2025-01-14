import { Activity, ActivitySkeleton } from "@/components/activity";
import {
  AnalyticsChart,
  AnalyticsChartSkeleton,
} from "@/components/charts/analytics";
import { OnboardingSteps } from "@/components/onboarding-steps";
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

  const translations = await trpc.translate.getTranslationsBySlug({
    slug: project,
    organizationId: organization,
  });

  // If there are no translations, show the onboarding
  if (!translations.length) {
    return <OnboardingSteps />;
  }

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
