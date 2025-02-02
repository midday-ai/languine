import { Activity } from "@/components/activity";
import { ActivitySkeleton } from "@/components/activity";
import { FilterLocales } from "@/components/filter-locales";
import { SearchInput } from "@/components/search-input";
import { HydrateClient, trpc } from "@/trpc/server";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ organization: string; project: string; q?: string }>;
}) {
  const t = await getTranslations("overrides");
  const { organization, project, q } = await params;

  //   trpc.project.getBySlug.prefetch({
  //     slug: project,
  //     organizationId: organization,
  //   });

  //   trpc.user.me.prefetch();

  //   trpc.organization.getById.prefetch({
  //     organizationId: organization,
  //   });

  trpc.translate.getTranslationsBySlug.prefetch({
    slug: project,
    organizationId: organization,
    search: q ?? null,
  });

  return (
    <HydrateClient>
      <div className="p-4 pt-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-normal">{t("title")}</h2>
          <div className="max-w-[340px] w-full hidden md:flex items-center gap-2">
            <SearchInput />
            <FilterLocales locales={["en", "fr", "es", "de", "it", "km"]} />
          </div>
        </div>

        <Suspense fallback={<ActivitySkeleton />}>
          <Activity />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
