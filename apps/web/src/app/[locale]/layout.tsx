import "../globals.css";

import { OpenPanelComponent } from "@openpanel/nextjs";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import languineConfig from "../../../languine.config";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Languine",
  description: "Translate your application with Languine CLI powered by AI.",
};

// Validate that the incoming `locale` parameter is valid
export function generateStaticParams() {
  return [...languineConfig.locale.targets, languineConfig.locale.source].map(
    (locale) => ({ locale }),
  );
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (
    ![...languineConfig.locale.targets, languineConfig.locale.source].includes(
      locale,
    )
  ) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark bg-noise bg-background">
      <body className={`${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>

        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID!}
          clientSecret={process.env.OPEN_PANEL_CLIENT_SECRET!}
          trackScreenViews={true}
          disabled={process.env.NODE_ENV !== "production"}
        />
      </body>
    </html>
  );
}
