"use client";

import { ActivityCard, ActivityCardSkeleton } from "@/components/activity-card";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Loader } from "./ui/loader";

export function Activity() {
  const { organization, project } = useParams();
  const t = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  const [{ pages }, allTranslationsQuery] =
    trpc.translate.getTranslationsBySlug.useSuspenseInfiniteQuery(
      {
        slug: project as string,
        organizationId: organization as string,
      },
      {
        getNextPageParam: (lastPage) => {
          const lastTranslation = lastPage[lastPage.length - 1];
          if (!lastTranslation || lastPage.length < 10) return undefined;
          return lastTranslation.id;
        },
      },
    );

  const { isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    allTranslationsQuery;

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
      { threshold: 0.5 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, pages.length]);

  if (!pages) return <ActivitySkeleton />;

  return (
    <div className="p-8">
      <h2 className="text-lg font-normal">{t("activity.title")}</h2>

      <div className="flex flex-col gap-4 mt-6">
        {pages.map((page) =>
          page.map((item) => (
            <ActivityCard
              key={item.id}
              source={item.sourceText}
              content={item.translatedText}
              createdAt={item.createdAt}
              commit={item.commit}
              targetLanguage={item.targetLanguage}
            />
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
              className="w-full mt-8"
              onClick={() => fetchNextPage()}
            >
              {t("activity.loadMore")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  const t = useI18n();

  return (
    <div className="p-8">
      <h2 className="text-lg font-normal">{t("activity.title")}</h2>
      <div className="flex flex-col gap-4 mt-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <ActivityCardSkeleton key={i.toString()} />
        ))}
      </div>
    </div>
  );
}
