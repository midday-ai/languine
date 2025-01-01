import { OpenPanelComponent } from "@openpanel/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Languine",
  description: "Translate your application with Languine CLI powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPEN_PANEL_CLIENT_ID!}
          clientSecret={process.env.OPEN_PANEL_CLIENT_SECRET!}
          trackScreenViews={true}
          disabled={process.env.NODE_ENV !== "production"}
        />
        {children}
      </body>
    </html>
  );
}
