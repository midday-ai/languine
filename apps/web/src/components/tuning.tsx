"use client";

import {
  SettingsCard,
  SettingsSeparator,
  SettingsTitle,
} from "@/components/settings-card";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { useParams } from "next/navigation";

export function Tuning() {
  const t = useI18n();
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
      <SettingsTitle title={t("tuning.general")} />
      <SettingsCard
        title={t("tuning.translationMemory.title")}
        description={t("tuning.translationMemory.description")}
        type="switch"
        checked={projectData.settings?.translationMemory ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ translationMemory: checked });
        }}
      />

      <SettingsCard
        title={t("tuning.qualityChecks.title")}
        description={t("tuning.qualityChecks.description")}
        type="switch"
        checked={projectData.settings?.qualityChecks ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ qualityChecks: checked });
        }}
      />

      <SettingsCard
        title={t("tuning.contextDetection.title")}
        description={t("tuning.contextDetection.description")}
        type="switch"
        checked={projectData.settings?.contextDetection ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ contextDetection: checked });
        }}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("tuning.styleGuide")} />
      <SettingsCard
        title={t("tuning.lengthControl.title")}
        description={t("tuning.lengthControl.description")}
        type="select"
        value={projectData.settings?.lengthControl ?? "flexible"}
        options={[
          {
            label: t("tuning.lengthControl.options.flexible"),
            value: "flexible",
          },
          { label: t("tuning.lengthControl.options.strict"), value: "strict" },
          { label: t("tuning.lengthControl.options.exact"), value: "exact" },
          { label: t("tuning.lengthControl.options.loose"), value: "loose" },
        ]}
        onChange={async (value) => {
          await handleUpdate({ lengthControl: value });
        }}
      />

      <SettingsCard
        title={t("tuning.inclusiveLanguage.title")}
        description={t("tuning.inclusiveLanguage.description")}
        type="switch"
        checked={projectData.settings?.inclusiveLanguage ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ inclusiveLanguage: checked });
        }}
      />

      <SettingsCard
        title={t("tuning.formality.title")}
        description={t("tuning.formality.description")}
        type="select"
        value={projectData.settings?.formality ?? "casual"}
        options={[
          { label: t("tuning.formality.options.casual"), value: "casual" },
          { label: t("tuning.formality.options.formal"), value: "formal" },
          { label: t("tuning.formality.options.neutral"), value: "neutral" },
        ]}
        onChange={async (value) => {
          await handleUpdate({ formality: value });
        }}
      />

      <SettingsCard
        title={t("tuning.toneOfVoice.title")}
        description={t("tuning.toneOfVoice.description")}
        type="select"
        value={projectData.settings?.toneOfVoice ?? "casual"}
        options={[
          { label: t("tuning.toneOfVoice.options.casual"), value: "casual" },
          { label: t("tuning.toneOfVoice.options.formal"), value: "formal" },
          {
            label: t("tuning.toneOfVoice.options.friendly"),
            value: "friendly",
          },
          {
            label: t("tuning.toneOfVoice.options.professional"),
            value: "professional",
          },
          { label: t("tuning.toneOfVoice.options.playful"), value: "playful" },
          { label: t("tuning.toneOfVoice.options.serious"), value: "serious" },
          {
            label: t("tuning.toneOfVoice.options.confident"),
            value: "confident",
          },
          { label: t("tuning.toneOfVoice.options.humble"), value: "humble" },
          { label: t("tuning.toneOfVoice.options.direct"), value: "direct" },
          {
            label: t("tuning.toneOfVoice.options.diplomatic"),
            value: "diplomatic",
          },
        ]}
        onChange={async (value) => {
          await handleUpdate({ toneOfVoice: value });
        }}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("tuning.brand")} />
      <SettingsCard
        title={t("tuning.brandName.title")}
        description={t("tuning.brandName.description")}
        type="input"
        placeholder={t("tuning.brandName.placeholder")}
        value={projectData.settings?.brandName ?? ""}
        onSave={async (value) => {
          await handleUpdate({ brandName: value });
        }}
      />

      <SettingsCard
        title={t("tuning.brandVoice.title")}
        description={t("tuning.brandVoice.description")}
        type="textarea"
        placeholder={t("tuning.brandVoice.placeholder")}
        value={projectData.settings?.brandVoice ?? ""}
        onSave={async (value) => {
          await handleUpdate({ brandVoice: value });
        }}
      />

      <SettingsCard
        title={t("tuning.emotiveIntent.title")}
        description={t("tuning.emotiveIntent.description")}
        type="select"
        value={projectData.settings?.emotiveIntent ?? "neutral"}
        options={[
          {
            label: t("tuning.emotiveIntent.options.neutral"),
            value: "neutral",
          },
          {
            label: t("tuning.emotiveIntent.options.positive"),
            value: "positive",
          },
          {
            label: t("tuning.emotiveIntent.options.empathetic"),
            value: "empathetic",
          },
          {
            label: t("tuning.emotiveIntent.options.professional"),
            value: "professional",
          },
          {
            label: t("tuning.emotiveIntent.options.friendly"),
            value: "friendly",
          },
          {
            label: t("tuning.emotiveIntent.options.enthusiastic"),
            value: "enthusiastic",
          },
        ]}
        onChange={async (value) => {
          await handleUpdate({ emotiveIntent: value });
        }}
      />

      <SettingsSeparator />

      <SettingsTitle title={t("tuning.domainExpertise.title")} />
      <SettingsCard
        title={t("tuning.domainExpertise.title")}
        description={t("tuning.domainExpertise.description")}
        type="select"
        value={projectData.settings?.domainExpertise ?? "general"}
        options={[
          {
            label: t("tuning.domainExpertise.options.general"),
            value: "general",
          },
          {
            label: t("tuning.domainExpertise.options.technical"),
            value: "technical",
          },
          {
            label: t("tuning.domainExpertise.options.medical"),
            value: "medical",
          },
          { label: t("tuning.domainExpertise.options.legal"), value: "legal" },
          {
            label: t("tuning.domainExpertise.options.financial"),
            value: "financial",
          },
          {
            label: t("tuning.domainExpertise.options.marketing"),
            value: "marketing",
          },
          {
            label: t("tuning.domainExpertise.options.academic"),
            value: "academic",
          },
        ]}
        onChange={async (value) => {
          await handleUpdate({ domainExpertise: value });
        }}
      />

      <SettingsCard
        title={t("tuning.idioms.title")}
        description={t("tuning.idioms.description")}
        type="switch"
        checked={projectData.settings?.idioms ?? true}
        onCheckedChange={async (checked) => {
          await handleUpdate({ idioms: checked });
        }}
      />
    </div>
  );
}
