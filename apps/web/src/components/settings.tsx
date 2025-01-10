"use client";

import { useI18n } from "@/locales/client";
import { useQueryState } from "nuqs";
import { AccountSettings } from "./settings/account";
import { ProjectSettings } from "./settings/project";
import { TeamSettings } from "./settings/team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
      id: "team",
      title: t("settings.tabs.team"),
    },
    {
      id: "account",
      title: t("settings.tabs.account"),
    },
  ];

  return (
    <div className="w-full px-8">
      <h2 className="text-lg p-8 pb-4 pl-0 pt-6 font-normal font-mono">
        Settings
      </h2>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent space-x-6 mb-4">
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
          <AccountSettings />
        </TabsContent>
        <TabsContent value="team">
          <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
