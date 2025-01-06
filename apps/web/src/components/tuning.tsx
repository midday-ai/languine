"use client";

import {
  SettingsCard,
  SettingsSeparator,
  SettingsTitle,
} from "@/components/settings-card";

export function Tuning() {
  return (
    <div className="px-8">
      <SettingsTitle title="General" />

      <SettingsCard
        title="Translation Memory"
        description="Use past translations to maintain consistency across your translations."
        type="switch"
        checked={true}
      />
      <SettingsCard
        title="Quality Checks"
        description="Automatically check for grammar, spelling and formatting issues."
        type="switch"
        checked={true}
      />
      <SettingsCard
        title="Context Detection"
        description="Analyze surrounding content to ensure translations match the intended context."
        type="switch"
        checked={true}
      />

      <SettingsSeparator />

      <SettingsTitle title="Style Guide" />
      <SettingsCard
        title="Length Control"
        description="Set target length ranges to keep translations concise and consistent."
        type="select"
        value="flexible"
        options={[
          { label: "Flexible", value: "flexible" },
          { label: "Strict", value: "strict" },
          { label: "Exact", value: "exact" },
          { label: "Loose", value: "loose" },
        ]}
      />
      <SettingsCard
        title="Inclusive Language"
        description="Use gender-neutral and inclusive language in translations."
        type="switch"
      />
      <SettingsCard
        title="Formality"
        description="Choose formal or casual language based on your audience."
        type="switch"
      />

      <SettingsCard
        title="Brand Name"
        description="Maintain your brand's name."
        type="input"
        placeholder="Acme Inc."
      />

      <SettingsCard
        title="Brand Voice"
        description="Maintain your brand's voice."
        type="textarea"
        placeholder="Add your style guide or brand voice description. Languine will use this to keep your brand's unique tone consistent across all translations."
      />

      <SettingsSeparator />

      <SettingsTitle title="Localization" />
      <SettingsCard
        title="Idioms"
        description="Handle expressions and sayings appropriately for each language."
        type="switch"
      />
      <SettingsCard
        title="Terminology"
        description="Manage industry-specific and technical terms consistently."
        type="switch"
      />
      <SettingsCard
        title="Cultural Adaptation"
        description="Adapt content to be culturally appropriate for each region."
        type="switch"
      />
    </div>
  );
}
