import { DangerZone } from "@/components/danger-zone";
import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
import { trpc } from "@/trpc/client";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

export function ProjectSettings() {
  const t = useTranslations("settings");
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
        title={t("project.name.title")}
        description={t("project.name.description")}
        type="input"
        placeholder={t("project.name.placeholder")}
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
        title={t("project.id.title")}
        description={t("project.id.description")}
        type="copy-input"
        placeholder={t("project.id.placeholder")}
        value={data?.id}
      />

      {project !== "default" && (
        <>
          <SettingsSeparator />
          <DangerZone
            title={t("project.delete.title")}
            description={t("project.delete.description")}
            buttonText={t("project.delete.button")}
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
