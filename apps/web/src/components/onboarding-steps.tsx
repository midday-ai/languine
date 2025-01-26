"use client";

import { useTranslations } from "next-intl";
import Step1 from "./onboarding/step-1";
import Step2 from "./onboarding/step-2";

export function OnboardingSteps({ projectId }: { projectId: string }) {
  const t = useTranslations("onboarding");

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] -ml-[70px]">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex flex-col relative">
          <Step1 projectId={projectId} />

          <Step2 />

          <p className="text-xs text-secondary text-center mt-10 leading-6">
            {t("info.description")}{" "}
            <a
              href="https://languine.ai/docs"
              className="underline hover:opacity-70"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("info.link")}
            </a>{" "}
            {t("info.description_2")}
          </p>
        </div>
      </div>
    </div>
  );
}
