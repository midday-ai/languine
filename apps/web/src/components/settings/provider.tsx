"use client";

import { SettingsCard } from "@/components/settings-card";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Icons } from "../ui/icons";

const OFUSCATED_API_KEY = "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

export function ProviderSettings() {
  const t = useI18n();
  const { organization, project } = useParams();

  const trpcUtils = trpc.useUtils();

  const [projectData] = trpc.project.getBySlug.useSuspenseQuery({
    slug: project as string,
    organizationId: organization as string,
  });

  const updateMutation = trpc.project.updateSettings.useMutation({
    onSuccess: () => {
      toast.success(t("settings.provider.updateSuccess"));
      trpcUtils.project.getBySlug.invalidate({
        slug: project as string,
        organizationId: organization as string,
      });
    },
    onError: (error) => {
      toast.error(t("settings.provider.updateError"));
    },
  });

  const providers = [
    { icon: Icons.OpenAI, value: "openai", label: "OpenAI" },
    { icon: Icons.xAI, value: "xai", label: "xAI" },
  ];

  const models = {
    openai: [
      { value: "gpt-4-turbo", label: "GPT-4 Turbo (Default)" },
      { value: "gpt-4", label: "GPT-4" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    xai: [{ value: "grok", label: "Grok" }],
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title={t("settings.provider.translationProvider.title")}
        description={t("settings.provider.translationProvider.description")}
        type="select"
        placeholder={t("settings.provider.translationProvider.placeholder")}
        value={projectData.settings?.provider}
        options={providers}
        onChange={async (value) => {
          await updateMutation.mutateAsync({
            slug: project as string,
            organizationId: organization as string,
            settings: {
              provider: value,
              model: models[value as keyof typeof models].at(0)?.value,
            },
          });
        }}
      />

      <SettingsCard
        title={t("settings.provider.languageModel.title")}
        description={t("settings.provider.languageModel.description")}
        type="select"
        placeholder={t("settings.provider.languageModel.placeholder")}
        value={projectData.settings?.model}
        options={
          models[projectData.settings?.provider as keyof typeof models] || []
        }
        onChange={async (value) => {
          await updateMutation.mutateAsync({
            slug: project as string,
            organizationId: organization as string,
            settings: {
              model: value,
            },
          });
        }}
      />

      <SettingsCard
        title={t("settings.provider.apiKey.title")}
        description={t("settings.provider.apiKey.description")}
        type="input"
        validate="password"
        placeholder={t("settings.provider.apiKey.placeholder")}
        value={
          (projectData.settings?.providerApiKey && OFUSCATED_API_KEY) || ""
        }
        onSave={async (value) => {
          await updateMutation.mutateAsync({
            slug: project as string,
            organizationId: organization as string,
            settings: {
              providerApiKey: value,
            },
          });
        }}
      />
    </div>
  );
}
