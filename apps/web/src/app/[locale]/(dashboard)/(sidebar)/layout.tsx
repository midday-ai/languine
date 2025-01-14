import { ComingSoon } from "@/components/coming-soon";
import { Header } from "@/components/dashboard/header";
import { GlobalModals } from "@/components/modals";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";
import { TRPCProvider } from "@/trpc/client";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const admins = ["pontus@lostisland.co", "viktor@midday.ai"];

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
    <TRPCProvider>
      <NuqsAdapter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <Sidebar />

            <SidebarInset className="flex-1 bg-noise pb-8">
              <Header />

              <main className="pt-4">
                {children}

                {!admins.includes(session.data.user.email) && <ComingSoon />}
                <Toaster />
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <GlobalModals />
      </NuqsAdapter>
    </TRPCProvider>
  );
}
