"use client";

import { Terminal } from "@/components/terminal";
import { useI18n } from "@/locales/client";
import Link from "next/link";
import { CopyInstall } from "./copy-install";
import { OutlinedButton } from "./ui/outlined-button";

export function Hero() {
  const t = useI18n();

  return (
    <div className="py-12 md:py-28 flex flex-row gap-12 justify-between items-center">
      <div className="lg:max-w-lg space-y-8 w-full">
        <h1 className="text-3xl">{t("hero.title")}</h1>
        <p className="text-secondary text-sm">{t("hero.description")}</p>
        <CopyInstall />

        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm text-secondary underline">
            <OutlinedButton>
              {t("getStarted.button.startAutomating")}
            </OutlinedButton>
          </Link>

          <Link
            href="https://git.new/languine"
            className="hidden md:block text-sm text-secondary underline"
          >
            <OutlinedButton variant="secondary">
              {t("getStarted.button.readDocumentation")}
            </OutlinedButton>
          </Link>
        </div>
      </div>

      <Terminal />
    </div>
  );
}
