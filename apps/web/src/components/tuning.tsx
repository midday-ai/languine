"use client";

import {
  SettingsCard,
  SettingsSeparator,
  SettingsTitle,
} from "@/components/settings-card";
import { useI18n } from "@/locales/client";

export function Tuning() {
  const t = useI18n();

  return (
    <div className="px-8">
      <SettingsTitle title={t("tuning.general")} />

      <SettingsCard
        title={t("tuning.translationMemory.title")}
        description={t("tuning.translationMemory.description")}
        type="switch"
        checked={true}
      />
      <SettingsCard
        title={t("tuning.qualityChecks.title")}
        description={t("tuning.qualityChecks.description")}
        type="switch"
        checked={true}
      />
      <SettingsCard
        title={t("tuning.contextDetection.title")}
        description={t("tuning.contextDetection.description")}
        type="switch"
        checked={true}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("tuning.styleGuide")} />
      <SettingsCard
        title={t("tuning.lengthControl.title")}
        description={t("tuning.lengthControl.description")}
        type="select"
        value="flexible"
        options={[
          {
            label: t("tuning.lengthControl.options.flexible"),
            value: "flexible",
          },
          { label: t("tuning.lengthControl.options.strict"), value: "strict" },
          { label: t("tuning.lengthControl.options.exact"), value: "exact" },
          { label: t("tuning.lengthControl.options.loose"), value: "loose" },
        ]}
      />
      <SettingsCard
        title={t("tuning.inclusiveLanguage.title")}
        description={t("tuning.inclusiveLanguage.description")}
        type="switch"
      />
      <SettingsCard
        title={t("tuning.formality.title")}
        description={t("tuning.formality.description")}
        type="switch"
      />

      <SettingsCard
        title={t("tuning.brandName.title")}
        description={t("tuning.brandName.description")}
        type="input"
        placeholder={t("tuning.brandName.placeholder")}
      />

      <SettingsCard
        title={t("tuning.brandVoice.title")}
        description={t("tuning.brandVoice.description")}
        type="textarea"
        placeholder={t("tuning.brandVoice.placeholder")}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("tuning.localization")} />
      <SettingsCard
        title={t("tuning.idioms.title")}
        description={t("tuning.idioms.description")}
        type="switch"
      />
      <SettingsCard
        title={t("tuning.terminology.title")}
        description={t("tuning.terminology.description")}
        type="switch"
      />
      <SettingsCard
        title={t("tuning.culturalAdaptation.title")}
        description={t("tuning.culturalAdaptation.description")}
        type="switch"
      />
    </div>
  );
}
