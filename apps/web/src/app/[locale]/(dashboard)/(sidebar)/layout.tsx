import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.data) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar />

        <SidebarInset className="flex-1 bg-noise">
          <Header />

          <main className="pt-4">
            {children}

            <Toaster position="bottom-left" />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
