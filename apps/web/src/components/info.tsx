"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { OutlinedButton } from "./ui/outlined-button";

export function Info() {
  const t = useTranslations("info");

  return (
    <>
      <div className="flex flex-col space-y-12 pb-12">
        <div>
          <h2 className="text-sm font-regular mb-4">
            {t("smartTranslation.title")}
          </h2>
          <ul className="text-secondary mt-4">
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("smartTranslation.intelligentTranslation")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("smartTranslation.brandVoice")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("smartTranslation.terminology")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("smartTranslation.linguisticFeatures")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("smartTranslation.realtimeUpdates")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("smartTranslation.overrides")}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-regular mb-4">
            {t("implementation.title")}
          </h2>
          <ul className="text-secondary mt-4">
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("implementation.quickSetup")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("implementation.fileFormat")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("implementation.contentStructure")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("implementation.assetOrganization")}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-regular mb-4">{t("developer.title")}</h2>
          <ul className="text-secondary mt-4">
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("developer.cli")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("developer.cicd")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("developer.versionControl")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("developer.workflow")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("developer.documentation")}
            </li>
          </ul>
        </div>
      </div>

      <Link href="/login">
        <OutlinedButton>{t("get_started")}</OutlinedButton>
      </Link>
    </>
  );
}
