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
import { deleteUserPreferences } from "@/lib/user-preferences";
import { trpc } from "@/trpc/client";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TeamSettings() {
  const t = useTranslations("settings");
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

      toast.success(t("apiKey.updated"), {
        description: t("apiKey.updatedDescription"),
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
      deleteUserPreferences();
      router.push("/login");
    },
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        toast.error(t("deleteTeamTitle"), {
          description: t("deleteTeamDescription"),
        });
      } else {
        toast.error(t("error"), {
          description: t("errorDescription"),
        });
      }
    },
  });

  return (
    <div>
      <SettingsCard
        title={t("team.name.title")}
        description={t("team.name.description")}
        type="input"
        placeholder={t("team.name.placeholder")}
        value={data?.name}
        onSave={async (value) => {
          await updateMutation.mutateAsync({
            organizationId: organization as string,
            name: value,
          });
        }}
      />

      <SettingsCard
        title={t("team.email.title")}
        description={t("team.email.description")}
        type="input"
        placeholder={t("team.email.placeholder")}
        value={data?.email}
        onSave={async (value) => {
          await updateMutation.mutateAsync({
            organizationId: organization as string,
            email: value,
          });
        }}
      />

      <SettingsCard
        title={t("team.apiKey.title")}
        description={t("team.apiKey.description")}
        type="copy-input"
        placeholder={t("team.apiKey.placeholder")}
        value={data?.apiKey}
        onUpdate={() => setShowUpdateKeyDialog(true)}
      />

      <AlertDialog
        open={showUpdateKeyDialog}
        onOpenChange={setShowUpdateKeyDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("apiKey.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("apiKey.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("apiKey.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                updateApiKey.mutate({ organizationId: organization as string })
              }
              disabled={updateApiKey.isPending}
              className="flex items-center gap-2"
            >
              {updateApiKey.isPending && <Spinner size="sm" />}
              {t("apiKey.continue")}
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
