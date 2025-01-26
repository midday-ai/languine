import { DocsNavigation, DocsSidebar } from "@/components/docs-sidebar";
import { Header } from "@/components/header";
import { DocsProvider } from "@/contexts/docs";

export default function DocsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <DocsProvider>
      <div className="p-6">
        <Header fullWidth />

        <div className="flex flex-col md:flex-row mt-10">
          <DocsSidebar />

          <div className="flex-1 max-w-3xl mx-auto relative md:-left-32">
            {children}
            <DocsNavigation />
          </div>
        </div>
      </div>
    </DocsProvider>
  );
}
