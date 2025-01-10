import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
import TeamManagement from "@/components/team-management";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";

export function TeamSettings() {
  const t = useI18n();
  const { organization } = useParams();

  const utils = trpc.useUtils();

  const [data] = trpc.organization.getById.useSuspenseQuery({
    id: organization as string,
  });

  const updateMutation = trpc.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.getAll.invalidate();
    },
  });

  return (
    <div>
      <SettingsCard
        title={t("settings.team.name.title")}
        description={t("settings.team.name.description")}
        type="input"
        placeholder={t("settings.team.name.placeholder")}
        value={data?.name}
        onSave={(value) => {
          updateMutation.mutate({
            id: organization as string,
            name: value,
          });
        }}
      />

      {/* <SettingsCard
        title={t("settings.team.billing.title")}
        description={t("settings.team.billing.description")}
        type="select"
        options={[
          { label: t("settings.team.billing.free"), value: "free" },
          { label: t("settings.team.billing.pro"), value: "pro" },
        ]}
        value={data?.plan}
      /> */}

      <SettingsCard
        title={t("settings.team.apiKey.title")}
        description={t("settings.team.apiKey.description")}
        type="copy-input"
        placeholder={t("settings.team.apiKey.placeholder")}
        value={data?.apiKey}
      />

      <SettingsSeparator />

      <TeamManagement />
    </div>
  );
}
