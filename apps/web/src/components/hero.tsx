"use client";

import { Terminal } from "@/components/terminal";
import { useI18n } from "@/locales/client";
import { CopyInstall } from "./copy-install";

export function Hero() {
  const t = useI18n();

  return (
    <div className="py-28 flex flex-row gap-12 justify-between items-center">
      <div className="md:max-w-lg space-y-8">
        <h1 className="text-3xl">{t("hero.title")}</h1>
        <p className="text-secondary text-sm">{t("hero.description")}</p>
        <CopyInstall />
      </div>

      <Terminal />
    </div>
  );
}
