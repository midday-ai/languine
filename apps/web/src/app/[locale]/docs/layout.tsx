import { DocsSidebar } from "@/components/docs-sidebar";
import { Header } from "@/components/header";

export default function DocsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <Header fullWidth />

      <div className="flex flex-row mt-10">
        <DocsSidebar />

        <div className="flex-1 max-w-3xl mx-auto relative md:-left-32">
          {children}
        </div>
      </div>
    </div>
  );
}
