"use client";

import { PackageManagerProvider } from "@/components/package-manager-context";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

interface DocsItem {
  href: string;
  label: string;
  external?: boolean;
}

interface DocsSection {
  title: string;
  items: DocsItem[];
}

interface DocsPageItem extends DocsItem {
  section: string;
}

interface DocsContextType {
  sections: DocsSection[];
  currentPage: DocsPageItem | null;
  nextPage: DocsPageItem | null;
  previousPage: DocsPageItem | null;
}

const DocsContext = createContext<DocsContextType | undefined>(undefined);

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("docs");
  const pathname = usePathname();

  const sections = [
    {
      title: t("getting-started"),
      items: [
        { href: "/docs/introduction", label: t("introduction") },
        { href: "/docs/quickstart", label: t("quickstart") },
        { href: "/docs/authentication", label: t("authentication") },
        { href: "/docs/configuration", label: t("configuration") },
      ],
    },
    {
      title: t("workflow"),
      items: [
        { href: "/docs/cli", label: t("cli") },
        { href: "/docs/ci", label: t("ci") },
        { href: "/docs/sdk", label: t("sdk") },
        { href: "/docs/api", label: t("api") },
      ],
    },
    {
      title: t("ci"),
      items: [{ href: "/docs/github-actions", label: t("github-actions") }],
    },
    // {
    //   title: t("presets"),
    //   items: [
    //     { href: "/docs/expo", label: "Expo" },
    //     { href: "/docs/react-email", label: "React Email" },
    //   ],
    // },
    {
      title: t("formats"),
      items: [
        { href: "/docs/json", label: "JSON" },
        { href: "/docs/yaml", label: "YAML" },
        { href: "/docs/properties", label: "Java Properties" },
        { href: "/docs/android", label: "Android" },
        { href: "/docs/ios", label: "iOS" },
        { href: "/docs/xcode-stringsdict", label: "iOS Stringsdict" },
        { href: "/docs/xcode-xcstrings", label: "iOS XCStrings" },
        { href: "/docs/md", label: "Markdown" },
        { href: "/docs/mdx", label: "MDX" },
        { href: "/docs/html", label: "HTML" },
        { href: "/docs/js", label: "JavaScript" },
        { href: "/docs/ts", label: "TypeScript" },
        { href: "/docs/po", label: "Gettext PO" },
        { href: "/docs/xliff", label: "XLIFF" },
        { href: "/docs/csv", label: "CSV" },
        { href: "/docs/xml", label: "XML" },
        { href: "/docs/arb", label: "Flutter ARB" },
      ],
    },
    {
      title: t("hooks"),
      items: [
        { href: "/docs/biome", label: "Biome" },
        { href: "/docs/prettier", label: "Prettier" },
      ],
    },
    {
      title: t("examples"),
      items: [
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/fumadocs",
          label: "Fumadocs",
          external: true,
        },
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/expo",
          label: "Expo",
          external: true,
        },
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/react-email",
          label: "React Email",
          external: true,
        },
        { href: "/docs/i18next", label: "i18next", external: true },
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/lingui",
          label: "Lingui",
          external: true,
        },
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/next-international",
          label: "Next International",
          external: true,
        },
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/react-i18next",
          label: "React i18next",
          external: true,
        },
        {
          href: "https://github.com/midday-ai/languine/tree/main/examples/next-intl",
          label: "Next Intl",
          external: true,
        },
      ],
    },
    // {
    //   title: t("platform"),
    //   items: [
    //     { href: "/docs/tuning", label: t("tuning") },
    //     { href: "/docs/overrides", label: t("overrides") },
    //     { href: "/docs/settings", label: t("settings") },
    //     { href: "/docs/team", label: t("team") },
    //   ],
    // },
  ];

  const value = useMemo(() => {
    // Flatten all pages for easier navigation
    const allPages = sections.flatMap((section) =>
      section.items.map((item) => ({
        ...item,
        section: section.title,
      })),
    );
    const pathWithoutLocale = pathname.split("/").slice(2).join("/");
    const currentPageIndex = allPages.findIndex(
      (page) =>
        ("external" in page ? !page.external : true) &&
        page.href === `/${pathWithoutLocale}`,
    );

    const currentPage =
      currentPageIndex !== -1 ? allPages[currentPageIndex] : null;
    const previousPage =
      currentPageIndex > 0 ? allPages[currentPageIndex - 1] : null;
    const nextPage =
      currentPageIndex < allPages.length - 1
        ? allPages[currentPageIndex + 1]
        : null;

    return {
      sections,
      currentPage,
      previousPage,
      nextPage,
    };
  }, [sections, pathname]);

  return (
    <DocsContext.Provider value={value}>
      <PackageManagerProvider>{children}</PackageManagerProvider>
    </DocsContext.Provider>
  );
}

export function useDocs() {
  const context = useContext(DocsContext);
  if (context === undefined) {
    throw new Error("useDocs must be used within a DocsProvider");
  }
  return context;
}
