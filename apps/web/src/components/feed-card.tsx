export function FeedCard({
  source,
  content,
}: { source: string; content: string }) {
  return (
    <div className="bg-[#121212] border border-border">
      <div className="text-secondary font-mono text-xs whitespace-nowrap overflow-hidden p-6">
        <span className="text-primary">{source} → </span>
        <span>{content}</span>
      </div>
    </div>
  );
}
