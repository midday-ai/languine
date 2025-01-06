"use client";

import { useQueryState } from "nuqs";
import { Account } from "./account";
import { DangerZone } from "./danger-zone";
import { SettingsCard, SettingsSeparator } from "./settings-card";
import TeamManagement from "./team-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const tabs = [
  {
    id: "project",
    title: "Project",
  },
  {
    id: "account",
    title: "Account",
  },
  {
    id: "team",
    title: "Team",
  },
];

const ProjectSettings = () => (
  <div>
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

    <SettingsSeparator />

    <DangerZone
      title="Delete Project"
      description="This action will delete the project and all associated data."
      buttonText="Delete Project"
      onDelete={() => {}}
    />
  </div>
);

const TeamSettings = () => (
  <div>
    <SettingsCard
      title="Team Name"
      description="The name of your team."
      type="input"
      placeholder="Enter team name"
    />

    <SettingsCard
      title="Billing"
      description="Manage your team's billing and subscription settings."
      type="select"
      options={[
        { label: "Free", value: "free" },
        { label: "Pro", value: "pro" },
      ]}
      value="free"
    />

    <SettingsCard
      title="API Key"
      description="Your API key for accessing the team programmatically. Use this for CI/CD integrations."
      type="copy-input"
      placeholder="Enter API key"
      value="api_1234567890"
    />

    <SettingsSeparator />

    <TeamManagement />
  </div>
);

export function Settings() {
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "project",
  });

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full px-8">
      <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent space-x-6 mb-4 mt-5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-none border-b-2 border-transparent text-secondary data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-2"
          >
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="project">
        <ProjectSettings />
      </TabsContent>
      <TabsContent value="account">
        <Account />
      </TabsContent>
      <TabsContent value="team">
        <TeamSettings />
      </TabsContent>
    </Tabs>
  );
}
