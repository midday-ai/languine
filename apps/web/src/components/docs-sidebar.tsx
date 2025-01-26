"use client";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function DocsSidebar() {
  const t = useTranslations("docs");
  const pathname = usePathname();

  const sections = [
    {
      title: t("getting-started"),
      items: [
        { href: "/docs/introduction", label: t("introduction") },
        { href: "/docs/installation", label: t("installation") },
        { href: "/docs/quickstart", label: t("quickstart") },
      ],
    },
    {
      title: t("guides"),
      items: [
        { href: "/docs/configuration", label: t("configuration") },
        { href: "/docs/cli", label: t("cli") },
        { href: "/docs/api", label: t("api") },
      ],
    },
    {
      title: t("advanced"),
      items: [
        { href: "/docs/custom-parsers", label: t("custom-parsers") },
        { href: "/docs/workflows", label: t("workflows") },
        { href: "/docs/self-hosting", label: t("self-hosting") },
      ],
    },
  ];

  return (
    <div className="w-64 pr-8 flex-shrink-0">
      <nav className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h5 className="mb-4 text-sm font-medium">{section.title}</h5>
            <ul className="space-y-2 pl-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block text-sm py-1 text-secondary hover:text-primary transition-colors",
                      pathname === item.href && "text-primary font-medium",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
