"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import Link from "next/link";
import { Suspense } from "react";
import { ChangeLanguage } from "./change-language";
import { GithubStars } from "./github-stars";
import { Logo } from "./logo";

export function Header() {
  const t = useI18n();

  const links = [
    // { href: "/pricing", label: t("header.pricing") },
    { href: "https://git.new/languine", label: t("header.docs") },
    { href: "/login", label: t("header.signIn"), className: "text-primary" },
  ];

  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="block">
        <Logo />
      </Link>

      <div className="flex items-center gap-6 text-sm">
        <Link href="https://github.com/midday-ai/languine">
          <Suspense fallback={<GithubStars />}>
            <GithubStars />
          </Suspense>
        </Link>

        <ChangeLanguage />

        {links.map((link) => (
          <Link
            href={link.href}
            className={cn(
              "text-secondary hover:text-primary transition-colors",
              link.className,
            )}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
