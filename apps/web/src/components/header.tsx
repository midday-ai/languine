"use client";

import { Logo } from "@/components/logo";
import { SignIn } from "@/components/sign-in";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { ChangeLanguage } from "./change-language";
import { GithubStars } from "./github-stars";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  const t = useTranslations("header");
  const pathname = usePathname();

  const links = [
    { href: "/pricing", label: t("pricing") },
    { href: "https://git.new/languine", label: t("docs") },
    {
      component: <SignIn />,
      className:
        pathname.split("/").length === 2
          ? "text-primary"
          : "text-secondary hover:text-primary",
    },
  ];

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between container mx-auto py-4">
        <Link href="/" className="block">
          <Logo />
        </Link>

        <div className="md:flex hidden items-center gap-6 text-sm">
          <Link href="https://git.new/languine">
            <Suspense fallback={<GithubStars />}>
              <GithubStars />
            </Suspense>
          </Link>

          <ChangeLanguage />

          <div className="hidden md:flex items-center gap-6 text-sm">
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
                    pathname?.endsWith(link.href) && "text-primary",
                  )}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>

        <MobileMenu />
      </div>
    </div>
  );
}
