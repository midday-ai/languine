import { FaGithub } from "react-icons/fa";

export function ActivityCard({
  source,
  content,
}: { source: string; content: string }) {
  return (
    <div className="bg-[#121212] bg-noise border border-border">
      <div className="text-secondary font-mono text-xs whitespace-nowrap overflow-hidden p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-primary">{source} → </span>
          <span>{content}</span>
        </div>
        <div className="flex items-center gap-2 text-secondary">
          <span>#146</span>
          <FaGithub />
          <span>30m ago</span>
        </div>
      </div>
    </div>
  );
}
