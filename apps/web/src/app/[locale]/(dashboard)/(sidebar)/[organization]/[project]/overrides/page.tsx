import { Activity } from "@/components/activity";
import { ActivitySkeleton } from "@/components/activity";
import { FilterLocales } from "@/components/filter-locales";
import { SearchInput } from "@/components/search-input";
import { HydrateClient, trpc } from "@/trpc/server";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

const PAGE_LIMIT = 25;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{
    organization: string;
    project: string;
  }>;
  searchParams: Promise<{
    q?: string;
    locales?: string;
  }>;
}) {
  const t = await getTranslations("overrides");
  const { organization, project } = await params;
  const { q, locales } = await searchParams;

  trpc.project.getBySlug.prefetch({
    slug: project,
    organizationId: organization,
  });

  trpc.user.me.prefetch();

  trpc.translate.getTranslationsBySlug.prefetchInfinite({
    slug: project,
    organizationId: organization,
    search: q ?? null,
    locales: locales?.split(",") ?? null,
    limit: PAGE_LIMIT,
  });

  return (
    <HydrateClient>
      <div className="p-4 pt-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-normal">{t("title")}</h2>
          <div className="max-w-[340px] w-full hidden md:flex items-center gap-2">
            <SearchInput />
            <FilterLocales />
          </div>
        </div>

        <Suspense fallback={<ActivitySkeleton limit={PAGE_LIMIT} />}>
          <Activity limit={PAGE_LIMIT} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
