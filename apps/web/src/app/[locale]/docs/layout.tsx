import { Sidebar } from "@/components/docs/sidebar";
import { Header } from "@/components/header";

export default function DocsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <Header />

      <div className="flex flex-row mt-10">
        <Sidebar />

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
