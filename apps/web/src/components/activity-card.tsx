import { formatTimeAgo } from "@/lib/format";
import { FaBitbucket, FaGithub } from "react-icons/fa";
import { Skeleton } from "./ui/skeleton";

type Props = {
  source: string;
  content: string;
  updatedAt: Date;
  commit?: string | null;
  commitLink?: string | null;
  sourceProvider?: string | null;
  targetLanguage: string;
};

export function ActivityCard({
  source,
  content,
  updatedAt,
  commit,
  commitLink,
  sourceProvider,
  targetLanguage,
}: Props) {
  return (
    <div className="border border-border">
      <div className="text-secondary font-mono text-xs whitespace-nowrap overflow-hidden p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden flex-1 max-w-[calc(100vw-400px)]">
          <span className="text-primary truncate">{source} → </span>
          <span
            className="truncate flex-1"
            title={`${targetLanguage}: ${content}`}
          >
            {targetLanguage}: {content}
          </span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          {commit && commitLink && (
            <a
              href={commitLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-secondary"
            >
              {sourceProvider === "github" && <FaGithub />}
              {sourceProvider === "bitbucket" && <FaBitbucket />}{" "}
              <span className="truncate max-w-[60px]">#{commit}</span>
            </a>
          )}

          <span>{formatTimeAgo(new Date(updatedAt))}</span>
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
