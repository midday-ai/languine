"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { CopyInstall } from "./copy-install";

export function ComingSoon() {
  const t = useTranslations("coming_soon");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 max-w-lg text-center p-8">
        <h2 className="text-2xl font-medium">{t("coming_soon.title")}</h2>
        <p className="text-muted-foreground">
          {t("coming_soon.description")}{" "}
          <a
            href="https://twitter.com/languine_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @languine_ai
          </a>{" "}
          {t("coming_soon.cta")}
        </p>
        <CopyInstall />
      </div>
    </div>
  );
}
