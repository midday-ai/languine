"use client";

import { useI18n } from "@/locales/client";
import { DangerZone } from "./danger-zone";
import { SettingsCard, SettingsSeparator } from "./settings-card";

export function Account() {
  const t = useI18n();

  return (
    <div>
      <SettingsCard
        title={t("account.fullName.title")}
        description={t("account.fullName.description")}
        type="input"
        placeholder={t("account.fullName.placeholder")}
      />

      <SettingsCard
        title={t("account.email.title")}
        description={t("account.email.description")}
        type="input"
        placeholder={t("account.email.placeholder")}
      />

      <SettingsCard
        title={t("account.apiKey.title")}
        description={t("account.apiKey.description")}
        type="copy-input"
        value="api_1234567890"
      />

      <SettingsSeparator />

      <DangerZone
        title={t("account.deleteAccount.title")}
        description={t("account.deleteAccount.description")}
        buttonText={t("account.deleteAccount.button")}
      />
    </div>
  );
}
