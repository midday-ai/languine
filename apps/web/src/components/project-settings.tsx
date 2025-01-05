"use client";

import { SettingsCard, SettingsTitle } from "./settings";

export function ProjectSettings() {
  return (
    <div>
      <SettingsTitle title="Project Settings" />

      <SettingsCard
        title="Project Name"
        description="The name of your project as it will appear across the platform."
        type="input"
        placeholder="Enter project name"
      />

      <SettingsCard
        title="Project ID"
        description="The unique identifier for your project."
        type="copy-input"
        placeholder="Enter project ID"
        value="1234567890"
      />

      <SettingsCard
        title="API Key"
        description="Your API key for accessing the project programmatically."
        type="copy-input"
        placeholder="Enter API key"
        value="api_1234567890"
      />
    </div>
  );
}
