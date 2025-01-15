"use client";

import { CopyInput } from "@/components/copy-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import { useParams } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";

export function OnboardingSteps() {
  const { project } = useParams();
  const t = useI18n();
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] -ml-[70px]">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex flex-col relative">
          <div>
            <Card
              className={cn(
                "overflow-hidden bg-transparent transition-opacity duration-300 border-dashed cursor-pointer",
                step < 1 ? "opacity-50" : "opacity-100 border-primary",
              )}
              onClick={() => setStep(1)}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-sm">
                  1. {t("onboarding.steps.1.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-secondary">
                  {t("onboarding.steps.1.description")}
                </p>
                <CopyInput
                  value={`npx languine@latest --p=${project}`}
                  onCopy={() => setStep(2)}
                  className="border-dashed text-xs"
                />
              </CardContent>
            </Card>

            <div
              className={cn(
                "w-[1px] h-8 border-l border-dashed mx-auto z-0",
                step >= 2 ? "border-primary" : "border-border",
              )}
            />
          </div>

          <Card
            className={cn(
              "overflow-hidden bg-transparent transition-opacity duration-300 border-dashed cursor-pointer",
              step < 2 ? "opacity-50" : "opacity-100 border-primary",
            )}
            onClick={() => setStep(2)}
          >
            <CardHeader className="py-4">
              <CardTitle className="text-sm">
                2. {t("onboarding.steps.2.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className=" flex items-center gap-1.5">
                {step === 2 && <Loader />}

                <p className="text-xs text-secondar">
                  {t("onboarding.steps.2.description")}
                </p>
              </div>
              <CopyInput
                value="npx languine@latest push"
                className="border-dashed"
              />
            </CardContent>
          </Card>

          <p className="text-xs text-secondary text-center mt-6 leading-6">
            {t("onboarding.info.description")}
            <a
              href="https://languine.ai/docs"
              className="underline hover:opacity-70"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("onboarding.info.link")}
              <br />
            </a>{" "}
            {t("onboarding.info.description_2")}
          </p>
        </div>
      </div>
    </div>
  );
}
