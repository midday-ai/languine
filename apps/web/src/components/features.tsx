"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { useI18n } from "@/locales/client";

export function Features() {
  const t = useI18n();

  const features = [
    {
      title: t("features.fullyOpenSource"),
    },
    {
      title: t("features.noVendorLockIn"),
    },
    {
      title: t("features.presetsForExpo"),
    },
    {
      title: t("features.presetForReactNative"),
    },
    {
      title: t("features.presetForReactEmail"),
    },
    {
      title: t("features.readyForI18nLibraries"),
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
                  <p className="text-secondary text-sm">Info</p>
                </div>
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
