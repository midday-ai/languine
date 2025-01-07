"use client";

import { useI18n } from "@/locales/client";
import Link from "next/link";
import MatrixTextWall from "./matrix";
import { OutlinedButton } from "./ui/outlined-button";

export function GetStarted() {
  const t = useI18n();

  return (
    <div className="relative">
      <div className="absolute left-1/2 -translate-x-1/2 bg-background -top-[10px] px-4 sm:px-8 uppercase text-center z-10">
        {t("getStarted.heading")}
      </div>

      <div className="border border-primary p-1 bg-background overflow-hidden">
        <div className="border border-primary px-4 sm:px-32 py-12 sm:py-24 flex flex-col sm:flex-row gap-4 bg-background overflow-hidden relative">
          <div className="space-y-4 z-10">
            <h4>{t("getStarted.description")}</h4>
            <p className="text-secondary text-sm">
              {t("getStarted.description")}
            </p>
            <div className="text-center sm:text-left">
              <Link href="/login">
                <OutlinedButton>
                  {t("getStarted.button.startAutomating")}
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
