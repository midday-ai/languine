"use client";

import { Terminal } from "@/components/terminal";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { CopyInstall } from "./copy-install";
import { OutlinedButton } from "./ui/outlined-button";

export function Hero() {
  const t = useTranslations("hero");
  const buttonT = useTranslations("getStarted.button");

  return (
    <div className="py-12 md:py-28 flex flex-col lg:flex-row gap-12 justify-between items-center">
      <div className="lg:max-w-[590px] space-y-8 w-full">
        <h1 className="xl:text-4xl text-3xl">{t("title")}</h1>
        <p className="text-secondary text-sm">{t("description")}</p>

        <div className="lg:max-w-[480px]">
          <CopyInstall />
        </div>

        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm text-secondary underline">
            <OutlinedButton>{buttonT("startAutomating")}</OutlinedButton>
          </Link>

          <Link
            href="/docs"
            className="hidden md:block text-sm text-secondary underline"
          >
            <OutlinedButton variant="secondary">
              {buttonT("readDocumentation")}
            </OutlinedButton>
          </Link>
        </div>
      </div>

      <Terminal />
    </div>
  );
}
