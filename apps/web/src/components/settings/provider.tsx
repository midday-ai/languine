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
      toast.success("Settings updated successfully");
      trpcUtils.project.getBySlug.invalidate({
        slug: project as string,
        organizationId: organization as string,
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update settings");
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
        title="Translation Provider"
        description="Choose your preferred AI service for generating translations. Each provider offers different capabilities and pricing."
        type="select"
        placeholder="Select a provider"
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
        title="Language Model"
        description="Select the AI model that best balances quality and speed for your translation needs. More powerful models may be slower but produce better results."
        type="select"
        placeholder="Select a model"
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
        title="Provider API Key"
        description="Enter your API key to authenticate with your chosen provider. Keep this key secure - we encrypt it before storing."
        type="input"
        validate="password"
        placeholder="Enter your API key"
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
