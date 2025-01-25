"use client";

import {
  SettingsCard,
  SettingsSeparator,
  SettingsTitle,
} from "@/components/settings-card";
import { trpc } from "@/trpc/client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export function Tuning() {
  const t = useTranslations("tuning");
  const { organization, project } = useParams();

  const trpcUtils = trpc.useUtils();

  const [projectData] = trpc.project.getBySlug.useSuspenseQuery({
    slug: project as string,
    organizationId: organization as string,
  });

  const updateMutation = trpc.project.updateSettings.useMutation({
    onMutate: async ({ settings }) => {
      await trpcUtils.project.getBySlug.cancel();

      const previousData = trpcUtils.project.getBySlug.getData({
        slug: project as string,
        organizationId: organization as string,
      });

      // Optimistically update to the new value
      trpcUtils.project.getBySlug.setData(
        { slug: project as string, organizationId: organization as string },
        // @ts-ignore
        (old) => {
          if (!old) return;

          return {
            ...old,
            settings: {
              ...old?.settings,
              ...settings,
            },
          };
        },
      );

      return { previousData };
    },
    onError: (_, __, context) => {
      trpcUtils.project.getBySlug.setData(
        { slug: project as string, organizationId: organization as string },
        context?.previousData,
      );
    },
    onSettled: () => {
      trpcUtils.project.getBySlug.invalidate({
        slug: project as string,
        organizationId: organization as string,
      });
    },
  });

  const handleUpdate = async (settings: Record<string, string | boolean>) => {
    await updateMutation.mutateAsync({
      slug: project as string,
      organizationId: organization as string,
      settings,
    });
  };

  return (
    <div className="px-8">
      <SettingsTitle title={t("general")} />
      <SettingsCard
        title={t("translationMemory.title")}
        description={t("translationMemory.description")}
        type="switch"
        checked={projectData.settings?.translationMemory ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ translationMemory: checked });
        }}
      />

      <SettingsCard
        title={t("qualityChecks.title")}
        description={t("qualityChecks.description")}
        type="switch"
        checked={projectData.settings?.qualityChecks ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ qualityChecks: checked });
        }}
      />

      <SettingsCard
        title={t("contextDetection.title")}
        description={t("contextDetection.description")}
        type="switch"
        checked={projectData.settings?.contextDetection ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ contextDetection: checked });
        }}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("styleGuide")} />
      <SettingsCard
        title={t("lengthControl.title")}
        description={t("lengthControl.description")}
        type="select"
        value={projectData.settings?.lengthControl ?? "flexible"}
        options={[
          {
            label: t("lengthControl.options.flexible"),
            value: "flexible",
          },
          { label: t("lengthControl.options.strict"), value: "strict" },
          { label: t("lengthControl.options.exact"), value: "exact" },
          { label: t("lengthControl.options.loose"), value: "loose" },
        ]}
        onChange={async (value) => {
          await handleUpdate({ lengthControl: value });
        }}
      />

      <SettingsCard
        title={t("inclusiveLanguage.title")}
        description={t("inclusiveLanguage.description")}
        type="switch"
        checked={projectData.settings?.inclusiveLanguage ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ inclusiveLanguage: checked });
        }}
      />

      <SettingsCard
        title={t("formality.title")}
        description={t("formality.description")}
        type="select"
        value={projectData.settings?.formality ?? "casual"}
        options={[
          { label: t("formality.options.casual"), value: "casual" },
          { label: t("formality.options.formal"), value: "formal" },
          { label: t("formality.options.neutral"), value: "neutral" },
        ]}
        onChange={async (value) => {
          await handleUpdate({ formality: value });
        }}
      />

      <SettingsCard
        title={t("toneOfVoice.title")}
        description={t("toneOfVoice.description")}
        type="select"
        value={projectData.settings?.toneOfVoice ?? "casual"}
        options={[
          { label: t("toneOfVoice.options.casual"), value: "casual" },
          { label: t("toneOfVoice.options.formal"), value: "formal" },
          {
            label: t("toneOfVoice.options.friendly"),
            value: "friendly",
          },
          {
            label: t("toneOfVoice.options.professional"),
            value: "professional",
          },
          { label: t("toneOfVoice.options.playful"), value: "playful" },
          { label: t("toneOfVoice.options.serious"), value: "serious" },
          {
            label: t("toneOfVoice.options.confident"),
            value: "confident",
          },
          { label: t("toneOfVoice.options.humble"), value: "humble" },
          { label: t("toneOfVoice.options.direct"), value: "direct" },
          {
            label: t("toneOfVoice.options.diplomatic"),
            value: "diplomatic",
          },
        ]}
        onChange={async (value) => {
          await handleUpdate({ toneOfVoice: value });
        }}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("brand")} />
      <SettingsCard
        title={t("brandName.title")}
        description={t("brandName.description")}
        type="input"
        placeholder={t("brandName.placeholder")}
        value={projectData.settings?.brandName ?? ""}
        onSave={async (value) => {
          await handleUpdate({ brandName: value });
        }}
      />

      <SettingsCard
        title={t("brandVoice.title")}
        description={t("brandVoice.description")}
        type="textarea"
        placeholder={t("brandVoice.placeholder")}
        value={projectData.settings?.brandVoice ?? ""}
        onSave={async (value) => {
          await handleUpdate({ brandVoice: value });
        }}
      />

      <SettingsCard
        title={t("emotiveIntent.title")}
        description={t("emotiveIntent.description")}
        type="select"
        value={projectData.settings?.emotiveIntent ?? "neutral"}
        options={[
          {
            label: t("emotiveIntent.options.neutral"),
            value: "neutral",
          },
          {
            label: t("emotiveIntent.options.positive"),
            value: "positive",
          },
          {
            label: t("emotiveIntent.options.empathetic"),
            value: "empathetic",
          },
          {
            label: t("emotiveIntent.options.professional"),
            value: "professional",
          },
          {
            label: t("emotiveIntent.options.friendly"),
            value: "friendly",
          },
          {
            label: t("emotiveIntent.options.enthusiastic"),
            value: "enthusiastic",
          },
        ]}
        onChange={async (value) => {
          await handleUpdate({ emotiveIntent: value });
        }}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("domainExpertise.title")} />
      <SettingsCard
        title={t("domainExpertise.title")}
        description={t("domainExpertise.description")}
        type="select"
        value={projectData.settings?.domainExpertise ?? "general"}
        options={[
          {
            label: t("domainExpertise.options.general"),
            value: "general",
          },
          {
            label: t("domainExpertise.options.technical"),
            value: "technical",
          },
          {
            label: t("domainExpertise.options.medical"),
            value: "medical",
          },
          { label: t("domainExpertise.options.legal"), value: "legal" },
          {
            label: t("domainExpertise.options.financial"),
            value: "financial",
          },
          {
            label: t("domainExpertise.options.marketing"),
            value: "marketing",
          },
          {
            label: t("domainExpertise.options.academic"),
            value: "academic",
          },
        ]}
        onChange={async (value) => {
          await handleUpdate({ domainExpertise: value });
        }}
      />

      <SettingsCard
        title={t("idioms.title")}
        description={t("idioms.description")}
        type="switch"
        checked={projectData.settings?.idioms ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ idioms: checked });
        }}
      />
    </div>
  );
}
