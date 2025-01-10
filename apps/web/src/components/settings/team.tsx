import { DangerZone } from "@/components/danger-zone";
import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
import { TeamManagement } from "@/components/team-management";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";

export function TeamSettings() {
  const t = useI18n();
  const { organization } = useParams();
  const router = useRouter();

  const utils = trpc.useUtils();

  const [data] = trpc.organization.getById.useSuspenseQuery({
    organizationId: organization as string,
  });

  const updateMutation = trpc.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.getAll.invalidate();
    },
  });

  const deleteMutation = trpc.organization.delete.useMutation({
    onSuccess: () => {
      router.replace("/");
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
        onSave={async (value) => {
          await updateMutation.mutateAsync({
            organizationId: organization as string,
            name: value,
          });
        }}
      />

      <SettingsCard
        title={t("settings.team.apiKey.title")}
        description={t("settings.team.apiKey.description")}
        type="copy-input"
        placeholder={t("settings.team.apiKey.placeholder")}
        value={data?.apiKey}
      />

      <SettingsSeparator />

      <TeamManagement />

      <SettingsSeparator />

      <DangerZone
        title="Delete Team"
        description="Permanently delete this team and all its data"
        buttonText="Delete Team"
        onDelete={() => {
          deleteMutation.mutate({
            organizationId: organization as string,
          });
        }}
      />
    </div>
  );
}
