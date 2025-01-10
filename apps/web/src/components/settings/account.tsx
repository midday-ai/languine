"use client";

import { DangerZone } from "@/components/danger-zone";
import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";

export function AccountSettings() {
  const t = useI18n();
  const [data] = trpc.user.me.useSuspenseQuery();
  const updateUser = trpc.user.update.useMutation();

  return (
    <div>
      <SettingsCard
        title={t("account.fullName.title")}
        description={t("account.fullName.description")}
        placeholder={t("account.fullName.placeholder")}
        value={data?.name ?? ""}
        onSave={async (value) => {
          await updateUser.mutateAsync({
            name: value,
          });
        }}
      />

      <SettingsCard
        title={t("account.email.title")}
        description={t("account.email.description")}
        type="input"
        validate="email"
        placeholder={t("account.email.placeholder")}
        value={data?.email ?? ""}
        onSave={async (value) => {
          await updateUser.mutateAsync({
            email: value,
          });
        }}
      />

      <SettingsCard
        title={t("account.apiKey.title")}
        description={t("account.apiKey.description")}
        type="copy-input"
        value={data?.apiKey ?? ""}
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
