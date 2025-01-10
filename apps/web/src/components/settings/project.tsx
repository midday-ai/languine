import { DangerZone } from "@/components/danger-zone";
import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";

export function ProjectSettings() {
  const t = useI18n();
  const router = useRouter();

  const { organization, project } = useParams();

  const trpcUtils = trpc.useUtils();

  const [data] = trpc.project.getBySlug.useSuspenseQuery({
    slug: project as string,
    organizationId: organization as string,
  });

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      trpcUtils.organization.getAll.invalidate();
    },
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      trpcUtils.organization.getAll.invalidate();
      router.replace(`/${organization}/default`);
    },
  });

  return (
    <div>
      <SettingsCard
        title={t("settings.project.name.title")}
        description={t("settings.project.name.description")}
        type="input"
        placeholder={t("settings.project.name.placeholder")}
        value={data?.name}
        onSave={async (value) => {
          const updated = await updateMutation.mutateAsync({
            slug: project as string,
            organizationId: organization as string,
            name: value,
          });
          router.replace(`/${organization}/${updated.slug}/settings`);
        }}
      />

      <SettingsCard
        title={t("settings.project.id.title")}
        description={t("settings.project.id.description")}
        type="copy-input"
        placeholder={t("settings.project.id.placeholder")}
        value={data?.id}
      />

      {project !== "default" && (
        <>
          <SettingsSeparator />
          <DangerZone
            title={t("settings.project.delete.title")}
            description={t("settings.project.delete.description")}
            buttonText={t("settings.project.delete.button")}
            onDelete={() => {
              deleteMutation.mutate({
                slug: project as string,
                organizationId: organization as string,
              });
            }}
          />
        </>
      )}
    </div>
  );
}
