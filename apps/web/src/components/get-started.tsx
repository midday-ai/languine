"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import MatrixTextWall from "./matrix";
import { OutlinedButton } from "./ui/outlined-button";

export function GetStarted() {
  const t = useTranslations("getStarted");

  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 bg-background -top-[10px] px-4 sm:px-8 uppercase text-center z-10">
        {t("heading")}
      </div>

      <div className="border border-primary p-1 bg-background overflow-hidden">
        <div className="border border-primary px-4 sm:px-32 py-12 sm:py-24 flex flex-col sm:flex-row gap-4 bg-background overflow-hidden relative">
          <div className="space-y-4 z-10">
            <h4 className="text-[16px] font-regular">{t("title")}</h4>
            <p className="text-secondary text-sm block pb-4">
              {t("description")}
            </p>

            <div className="flex items-center gap-8 text-center sm:text-left">
              <Link href="/login">
                <OutlinedButton>{t("button.startAutomating")}</OutlinedButton>
              </Link>

              <Link
                href="/docs"
                className="hidden md:block text-sm text-secondary underline"
              >
                <OutlinedButton variant="secondary">
                  {t("button.readDocumentation")}
                </OutlinedButton>
              </Link>
            </div>
          </div>

          <MatrixTextWall />
        </div>
      </div>
    </div>
  );
}
