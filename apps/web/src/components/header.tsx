"use client";

import { Logo } from "@/components/logo";
import { SignIn } from "@/components/sign-in";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import Link from "next/link";
import { Suspense } from "react";
import { ChangeLanguage } from "./change-language";
import { GithubStars } from "./github-stars";

export function Header() {
  const t = useI18n();

  const links = [
    { href: "/pricing", label: t("header.pricing") },
    { href: "https://git.new/languine", label: t("header.docs") },
    {
      component: <SignIn />,
      className: "text-primary",
    },
  ];

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between container mx-auto py-4">
        <Link href="/" className="block">
          <Logo />
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="https://git.new/languine">
            <Suspense fallback={<GithubStars />}>
              <GithubStars />
            </Suspense>
          </Link>

          <ChangeLanguage />

          {links.map((link, i) =>
            link.component ? (
              <div
                key={i.toString()}
                className={cn(
                  "text-secondary hover:text-primary transition-colors",
                  link.className,
                )}
              >
                {link.component}
              </div>
            ) : (
              <Link
                href={link.href!}
                className={cn(
                  "text-secondary hover:text-primary transition-colors hidden md:block",
                  link.className,
                )}
                key={link.href}
              >
                {link.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
