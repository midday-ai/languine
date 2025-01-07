"use client";

import { useI18n } from "@/locales/client";
import { useQueryState } from "nuqs";
import { Account } from "./account";
import { DangerZone } from "./danger-zone";
import { SettingsCard, SettingsSeparator } from "./settings-card";
import TeamManagement from "./team-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

function ProjectSettings() {
  const t = useI18n();

  return (
    <div>
      <SettingsCard
        title={t("settings.project.name.title")}
        description={t("settings.project.name.description")}
        type="input"
        placeholder={t("settings.project.name.placeholder")}
      />

      <SettingsCard
        title={t("settings.project.id.title")}
        description={t("settings.project.id.description")}
        type="copy-input"
        placeholder={t("settings.project.id.placeholder")}
        value="1234567890"
      />

      <SettingsSeparator />

      <DangerZone
        title={t("settings.project.delete.title")}
        description={t("settings.project.delete.description")}
        buttonText={t("settings.project.delete.button")}
        onDelete={() => {}}
      />
    </div>
  );
}

function TeamSettings() {
  const t = useI18n();

  return (
    <div>
      <SettingsCard
        title={t("settings.team.name.title")}
        description={t("settings.team.name.description")}
        type="input"
        placeholder={t("settings.team.name.placeholder")}
      />

      <SettingsCard
        title={t("settings.team.billing.title")}
        description={t("settings.team.billing.description")}
        type="select"
        options={[
          { label: t("settings.team.billing.free"), value: "free" },
          { label: t("settings.team.billing.pro"), value: "pro" },
        ]}
        value="free"
      />

      <SettingsCard
        title={t("settings.team.apiKey.title")}
        description={t("settings.team.apiKey.description")}
        type="copy-input"
        placeholder={t("settings.team.apiKey.placeholder")}
        value="api_1234567890"
      />

      <SettingsSeparator />

      <TeamManagement />
    </div>
  );
}

export function Settings() {
  const t = useI18n();
  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "project",
  });

  const tabs = [
    {
      id: "project",
      title: t("settings.tabs.project"),
    },
    {
      id: "account",
      title: t("settings.tabs.account"),
    },
    {
      id: "team",
      title: t("settings.tabs.team"),
    },
  ];

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
