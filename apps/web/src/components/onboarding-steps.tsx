"use client";

import { CopyInput } from "@/components/copy-input";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { ProviderSettingsModal } from "./modals/provider-settings";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function OnboardingSteps() {
  const { organization, project } = useParams();

  const { data } = trpc.project.getBySlug.useQuery({
    slug: project as string,
    organizationId: organization as string,
  });

  const [step, setStep] = useQueryState("step", {
    defaultValue: "1",
  });

  useEffect(() => {
    if (data?.settings?.providerApiKey && step === "1") {
      setStep("2");
    }
  }, [data?.settings]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-100px)] -ml-[70px]">
      <div className="max-w-xl w-full space-y-6">
        <div className="flex flex-col relative">
          <div>
            <Card
              className={cn(
                "overflow-hidden z-10 bg-transparent transition-opacity duration-300 border-dashed",
                Number(step) < 1 ? "opacity-50" : "opacity-100 border-primary",
              )}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-sm">1. Connect Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-secondary">
                  Connect your AI provider to start generating translations
                </p>
                <ProviderSettingsModal
                  isConnected={!!data?.settings?.providerApiKey}
                />
              </CardContent>
            </Card>

            <div
              className={cn(
                "w-[1px] h-8 border-l border-dashed mx-auto z-0",
                Number(step) >= 2 ? "border-primary" : "border-border",
              )}
            />
          </div>

          <div>
            <Card
              className={cn(
                "overflow-hidden bg-transparent transition-opacity duration-300 border-dashed",
                Number(step) < 2 ? "opacity-50" : "opacity-100 border-primary",
              )}
            >
              <CardHeader className="py-4">
                <CardTitle className="text-sm">2. Setup Languine CLI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-secondary">
                  Install and configure the Languine CLI to manage translations
                </p>
                <CopyInput
                  value="npx languine@latest"
                  onCopy={() => setStep("3")}
                  className="border-dashed"
                />
              </CardContent>
            </Card>

            <div
              className={cn(
                "w-[1px] h-8 border-l border-dashed mx-auto z-0",
                Number(step) >= 3 ? "border-primary" : "border-border",
              )}
            />
          </div>

          <Card
            className={cn(
              "overflow-hidden bg-transparent transition-opacity duration-300 border-dashed",
              Number(step) < 3 ? "opacity-50" : "opacity-100 border-primary",
            )}
          >
            <CardHeader className="py-4">
              <CardTitle className="text-sm">3. Push Translations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-secondary">
                Push your first translations using the Languine CLI
              </p>
              <CopyInput
                value="npx languine@latest push"
                className="border-dashed"
              />
            </CardContent>
          </Card>

          <p className="text-xs text-secondary text-center mt-6 leading-6">
            Need help? Check out our{" "}
            <a
              href="https://languine.ai/docs"
              className="underline hover:opacity-70"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
              <br />
            </a>{" "}
            for detailed guides and best practices.
          </p>
        </div>
      </div>
    </div>
  );
}
