"use client";

import { DangerZone } from "./danger-zone";
import { SettingsCard, SettingsSeparator } from "./settings-card";

export function Account() {
  return (
    <div>
      <SettingsCard
        title="Full Name"
        description="Your full name as it will appear across the platform."
        type="input"
        placeholder="Enter your full name"
      />

      <SettingsCard
        title="Email Address"
        description="The email address associated with your account."
        type="input"
        placeholder="Enter your email address"
      />

      <SettingsCard
        title="API Key"
        description="Your personal API key for accessing the Languine API."
        type="copy-input"
        value="api_1234567890"
      />

      <SettingsSeparator />

      <DangerZone
        title="Delete Account"
        description="Permanently delete your account and all associated data. This action cannot be undone."
        buttonText="Delete Account"
      />
    </div>
  );
}
