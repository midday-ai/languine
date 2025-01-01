import { RootProvider } from "fumadocs-ui/provider";
import "fumadocs-ui/style.css";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { I18nProvider } from "fumadocs-ui/i18n";
import { baseOptions } from "../layout.config";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";

const inter = Inter({
  subsets: ["latin"],
});

export default async function Layout({
  params,
  children,
}: { params: Promise<{ lang: string }>; children: ReactNode }) {
  return (
    <html
      lang={(await params).lang}
      className={inter.className}
      suppressHydrationWarning
    >
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <I18nProvider
          locale={(await params).lang}
          locales={[
            { locale: "en", name: "English" },
            { locale: "cn", name: "Chinese" },
          ]}
          translations={
            {
              en: (await import("@/content/ui.json")).default,
              cn: (await import("@/content/ui.cn.json")).default,
            }[(await params).lang]
          }
        >
          <RootProvider>
            <DocsLayout
              tree={source.pageTree[(await params).lang]}
              {...baseOptions}
            >
              {children}
            </DocsLayout>
          </RootProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
