import { formatTimeAgo } from "@/lib/format";
import { FaGithub } from "react-icons/fa";
import { Skeleton } from "./ui/skeleton";

type Props = {
  source: string;
  content: string;
  createdAt: string;
  commit?: string | null;
  targetLanguage: string;
};

export function ActivityCard({
  source,
  content,
  createdAt,
  commit,
  targetLanguage,
}: Props) {
  return (
    <div className="border border-border">
      <div className="text-secondary font-mono text-xs whitespace-nowrap overflow-hidden p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{source} → </span>
          <span>
            {targetLanguage}: {content}
          </span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          {commit && (
            <>
              <span>#{commit}</span> <FaGithub />
            </>
          )}

          <span>{formatTimeAgo(new Date(createdAt))}</span>
        </div>
      </div>
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="border border-border h-[66px]">
      <div className="text-secondary font-mono text-xs whitespace-nowrap overflow-hidden p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-4" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
