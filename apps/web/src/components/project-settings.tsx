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
    </div>
  );
}
