import { Activity, ActivitySkeleton } from "@/components/activity";
import {
  AnalyticsChart,
  AnalyticsChartSkeleton,
} from "@/components/charts/analytics";
import { OnboardingSteps } from "@/components/onboarding-steps";
import { PeriodSelector } from "@/components/period-selector";
import { SearchInput } from "@/components/search-input";
import { getI18n } from "@/locales/server";
import { HydrateClient, trpc } from "@/trpc/server";
import { Suspense } from "react";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ organization: string; project: string }>;
  searchParams: Promise<{
    q?: string;
    period?: "monthly" | "weekly" | "daily";
  }>;
}) {
  const t = await getI18n();
  const { organization, project } = await params;
  const { q, period } = await searchParams;

  trpc.analytics.getProjectStats.prefetch({
    projectSlug: project,
    organizationId: organization,
    period: period ?? ("daily" as "monthly" | "weekly" | "daily"),
  });

  trpc.translate.getTranslationsBySlug.prefetchInfinite({
    slug: project,
    organizationId: organization,
    search: q ?? null,
  });

  const translations = await trpc.translate.getTranslationsBySlug({
    slug: project,
    organizationId: organization,
    search: q ?? null,
  });

  // If there are no translations, show the onboarding
  if (!translations.length && !q) {
    const data = await trpc.project.getBySlug({
      slug: project,
      organizationId: organization,
    });

    return <OnboardingSteps projectId={data?.id} />;
  }

  return (
    <HydrateClient>
      <Suspense fallback={<AnalyticsChartSkeleton />}>
        <AnalyticsChart />
      </Suspense>

      <div className="h-10 mt-10 w-full bg-dotted" />

      <div className="p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-normal">{t("activity.title")}</h2>
          <div className="max-w-72 w-full">
            <SearchInput />
          </div>
        </div>

        <Suspense fallback={<ActivitySkeleton />}>
          <Activity />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
