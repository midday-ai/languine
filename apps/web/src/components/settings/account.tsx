"use client";

import { DangerZone } from "@/components/danger-zone";
import { SettingsCard, SettingsSeparator } from "@/components/settings-card";
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
import { authClient } from "@/lib/auth/client";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function AccountSettings() {
  const t = useI18n();
  const router = useRouter();
  const [showUpdateKeyDialog, setShowUpdateKeyDialog] = useState(false);
  const utils = trpc.useUtils();

  const [data] = trpc.user.me.useSuspenseQuery();
  const updateUser = trpc.user.update.useMutation();

  const updateApiKey = trpc.user.updateApiKey.useMutation({
    onSuccess: async (data) => {
      utils.user.me.invalidate();

      await navigator.clipboard.writeText(data.apiKey);

      setShowUpdateKeyDialog(false);

      toast.success(t("settings.apiKey.updated"), {
        description: t("settings.apiKey.updatedDescription"),
      });
    },
  });

  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    },
  });

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
              onClick={() => updateApiKey.mutate()}
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

      <DangerZone
        title={t("account.deleteAccount.title")}
        description={t("account.deleteAccount.description")}
        buttonText={t("account.deleteAccount.button")}
        onDelete={() => {
          deleteUser.mutate();
        }}
      />
    </div>
  );
}
