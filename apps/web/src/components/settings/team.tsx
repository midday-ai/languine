import { DangerZone } from "@/components/danger-zone";
import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
import { TeamManagement } from "@/components/team-management";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TeamSettings() {
  const t = useI18n();
  const { organization } = useParams();
  const router = useRouter();

  const utils = trpc.useUtils();

  const [showUpdateKeyDialog, setShowUpdateKeyDialog] = useState(false);

  const updateApiKey = trpc.organization.updateApiKey.useMutation({
    onSuccess: async (data) => {
      utils.organization.getById.invalidate({
        organizationId: organization as string,
      });

      await navigator.clipboard.writeText(data.apiKey);

      setShowUpdateKeyDialog(false);

      toast.success(t("settings.apiKey.updated"), {
        description: t("settings.apiKey.updatedDescription"),
      });
    },
  });

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
    onError: () => {
      toast.error(t("settings.permissionDenied"), {
        description: t("settings.permissionDeniedDescription"),
      });
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
        onUpdate={() => setShowUpdateKeyDialog(true)}
      />

      <AlertDialog
        open={showUpdateKeyDialog}
        onOpenChange={setShowUpdateKeyDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.apiKey.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.apiKey.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("settings.apiKey.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                updateApiKey.mutate({ organizationId: organization as string })
              }
              disabled={updateApiKey.isPending}
              className="flex items-center gap-2"
            >
              {updateApiKey.isPending && <Spinner size="sm" />}
              {t("settings.apiKey.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
