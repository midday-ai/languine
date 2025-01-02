"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { useI18n } from "@/locales/client";

export function Features() {
  const t = useI18n();

  const features = [
    {
      title: t("features.fullyOpenSource"),
      description: t("features.fullyOpenSourceDescription"),
    },
    {
      title: t("features.noVendorLockIn"),
      description: t("features.noVendorLockInDescription"),
    },
    {
      title: t("features.presetsForExpo"),
      description: t("features.presetsForExpoDescription"),
    },
    {
      title: t("features.presetForReactNative"),
      description: t("features.presetForReactNativeDescription"),
    },
    {
      title: t("features.presetForReactEmail"),
      description: t("features.presetForReactEmailDescription"),
    },
    {
      title: t("features.readyForI18nLibraries"),
      description: t("features.readyForI18nLibrariesDescription"),
    },
  ];

  return (
    <div>
      <h3>{t("features.title")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {features.map((feature) => (
          <div
            className="border border-primary p-1 -mt-[1px]"
            key={feature.title}
          >
            <Card className="rounded-none border-none p-4">
              <CardHeader>
                <div className="space-y-4">
                  <h3 className="text-xl font-medium">{feature.title}</h3>
                  <p className="text-secondary text-sm">
                    {feature.description}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
