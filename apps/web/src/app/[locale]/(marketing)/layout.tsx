import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { I18nProviderClient } from "@/locales/client";
import type { ReactElement } from "react";

export default async function SubLayout({
  params,
  children,
}: { params: Promise<{ locale: string }>; children: ReactElement }) {
  const { locale } = await params;

  return (
    <I18nProviderClient locale={locale}>
      <div className="p-6">
        <Header />
        <div className="container mx-auto">{children}</div>
        <Footer />
      </div>
    </I18nProviderClient>
  );
}
