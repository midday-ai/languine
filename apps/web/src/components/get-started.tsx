"use client";

import { useI18n } from "@/locales/client";
import Link from "next/link";
import OutlinedButton from "./ui/outlined-button";

export function GetStarted() {
  const t = useI18n();

  return (
    <div className="relative">
      <div className="border border-primary p-1">
        <div className="border border-primary px-32 py-24 flex flex-row gap-4">
          <div className="absolute left-1/2 -translate-x-1/2 bg-background -top-[10px] px-8 uppercase">
            {t("getStarted.heading")}
          </div>
          <div className="space-y-4">
            <h4>{t("getStarted.description")}</h4>
            <p className="text-secondary text-sm">
              {t("getStarted.description")}
            </p>

            <div>
              <Link href="/login">
                <OutlinedButton>{t("getStarted.button")}</OutlinedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
