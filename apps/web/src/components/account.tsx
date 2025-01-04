"use client";

import { SettingsCard, SettingsTitle } from "./settings";

export function Account() {
  return (
    <div>
      <SettingsTitle title="Account Settings" />

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
        title="Email Notifications"
        description="Choose which email notifications you'd like to receive."
        type="switch"
        checked={true}
      />

      <SettingsCard
        title="Marketing Emails"
        description="Receive updates about new features and promotions."
        type="switch"
        checked={false}
      />
    </div>
  );
}
