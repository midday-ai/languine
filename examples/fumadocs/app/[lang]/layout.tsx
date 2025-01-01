import { RootProvider } from "fumadocs-ui/provider";
import "fumadocs-ui/style.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { I18nProvider } from "fumadocs-ui/i18n";
import { baseOptions } from "../layout.config";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { i18n } from "@/lib/i18n";
import { notFound } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
});

export default async function Layout({
  params,
  children,
}: { params: Promise<{ lang: string }>; children: ReactNode }) {
  const lang = (await params).lang as "en" | "cn";
  if (!i18n.languages.includes(lang)) notFound();

  return (
    <html lang={lang} className={inter.className} suppressHydrationWarning>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <I18nProvider
          locale={lang}
          locales={[
            { locale: "en", name: "English" },
            { locale: "cn", name: "Chinese" },
          ]}
          translations={
            {
              en: (await import("@/content/ui.json")).default,
              cn: (await import("@/content/ui.cn.json")).default,
            }[lang]
          }
        >
          <RootProvider>
            <DocsLayout tree={source.pageTree[lang]} {...baseOptions(lang)}>
              {children}
            </DocsLayout>
          </RootProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
