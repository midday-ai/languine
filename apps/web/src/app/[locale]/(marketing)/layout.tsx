import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className="p-6">
      <Header />

      <main className="container mx-auto">{children}</main>
      <Footer />
    </div>
  );
}
