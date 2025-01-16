import "../globals.css";

import { OpenPanelComponent } from "@openpanel/nextjs";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "./providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Languine",
  description: "Translate your application with Languine CLI powered by AI.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale} className="dark bg-noise bg-background">
      <body className={`${geistMono.variable} antialiased`}>
        <Providers locale={locale}>{children}</Providers>

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
