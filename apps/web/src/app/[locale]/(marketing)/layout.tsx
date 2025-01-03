import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getStaticParams } from "@/locales/server";
import { setStaticParamsLocale } from "next-international/server";
import type { ReactElement } from "react";

export function generateStaticParams() {
  return getStaticParams();
}

export default async function Layout({
  children,
  params,
}: {
  children: ReactElement;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setStaticParamsLocale(locale);

  return (
    <div className="p-6 bg-noise">
      <Header />

      <div className="container mx-auto">{children}</div>
      <Footer />
    </div>
  );
}
