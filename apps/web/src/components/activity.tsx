"use client";

import { ActivityCard, ActivityCardSkeleton } from "@/components/activity-card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useSearch } from "@/hooks/use-search";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { useDeferredValue, useEffect, useRef } from "react";

export function Activity() {
  const { organization, project } = useParams();
  const { search, setSearch } = useSearch();
  const deferredSearch = useDeferredValue(search);

  const t = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  const [{ pages }, allTranslationsQuery] =
    trpc.translate.getTranslationsBySlug.useSuspenseInfiniteQuery(
      {
        slug: project as string,
        organizationId: organization as string,
        search: deferredSearch,
      },
      {
        getNextPageParam: (lastPage) => {
          const lastTranslation = lastPage[lastPage.length - 1];
          if (!lastTranslation || lastPage.length < 10) return undefined;
          return lastTranslation.id;
        },
      },
    );

  const {
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = allTranslationsQuery;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          pages.length > 1
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.3 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, pages.length]);

  if (!pages) return <ActivitySkeleton />;

  if (search && pages[0].length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 mt-24">
        <p className="text-secondary text-sm">
          {t("activity.noResults", { search })}
        </p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setSearch("")}
        >
          {t("activity.clearSearch")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mt-6">
      {pages.map((page) =>
        page.map((item) => (
          <div key={item.id}>
            <ActivityCard
              source={item.sourceText}
              content={item.translatedText}
              updatedAt={item.updatedAt}
              commit={item.commit}
              targetLanguage={item.targetLanguage}
              commitLink={item.commitLink}
              sourceProvider={item.sourceProvider}
              sourceType={item.sourceType as "key" | "document"}
            />
          </div>
        )),
      )}

      <div
        ref={containerRef}
        className="h-8 flex items-center justify-center w-full"
      >
        {isFetching && (
          <div className="flex items-center gap-2 pt-8">
            <Loader />
            <span className="text-xs text-secondary">
              {t("activity.loading")}...
            </span>
          </div>
        )}

        {hasNextPage && pages.length === 1 && !isFetching && (
          <Button
            variant="outline"
            className="w-full mt-8 font-normal text-secondary"
            onClick={() => fetchNextPage()}
          >
            {t("activity.loadMore")}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-4 mt-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <ActivityCardSkeleton key={i.toString()} />
      ))}
    </div>
  );
}
