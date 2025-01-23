"use client";

import { useI18n } from "@/locales/client";

export function Info() {
  const t = useI18n();

  return (
    <>
      <div className="flex flex-col space-y-12">
        <div>
          <h2 className="text-sm font-regular mb-4">
            {t("info.smartTranslation.title")}
          </h2>
          <ul className="text-secondary mt-4">
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.smartTranslation.intelligentTranslation")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.smartTranslation.brandVoice")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.smartTranslation.terminology")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.smartTranslation.linguisticFeatures")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.smartTranslation.realtimeUpdates")}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-regular mb-4">
            {t("info.implementation.title")}
          </h2>
          <ul className="text-secondary mt-4">
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.implementation.quickSetup")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.implementation.fileFormat")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.implementation.contentStructure")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.implementation.assetOrganization")}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-regular mb-4">
            {t("info.developer.title")}
          </h2>
          <ul className="text-secondary mt-4">
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("info.developer.cli")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("info.developer.cicd")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.developer.versionControl")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span> {t("info.developer.workflow")}
            </li>
            <li className="text-sm">
              <span className="text-lg">◇</span>{" "}
              {t("info.developer.documentation")}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
