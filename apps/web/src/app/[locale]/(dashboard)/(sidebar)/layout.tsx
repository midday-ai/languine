import { ComingSoon } from "@/components/coming-soon";
import { Header } from "@/components/dashboard/header";
import { GlobalModals } from "@/components/modals";
import { GlobalSheets } from "@/components/sheets";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/contexts/session";
import { TRPCProvider } from "@/trpc/client";
import { getSession } from "@languine/supabase/session";
import { get } from "@vercel/edge-config";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await getSession();

  if (!session) {
    return redirect("/login");
  }

  const invited = (await get("invited")) as string[];

  return (
    <SessionProvider session={session}>
      <TRPCProvider>
        <NuqsAdapter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <Sidebar />

              <SidebarInset className="flex-1 bg-noise pb-8">
                <Header />

                <main className="pt-4">
                  {children}

                  {!invited?.includes(session?.user.email ?? "") && (
                    <ComingSoon />
                  )}
                  <Toaster />
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <GlobalModals />
          <GlobalSheets />
        </NuqsAdapter>
      </TRPCProvider>
    </SessionProvider>
  );
}
