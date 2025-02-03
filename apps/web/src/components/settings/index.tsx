"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { AccountSettings } from "./account";
import { BillingSettings } from "./billing";
import { ProjectSettings } from "./project";
import { TeamSettings } from "./team";

export function Settings() {
  const t = useTranslations("settings");

  const [tab, setTab] = useQueryState("tab", {
    defaultValue: "project",
  });

  const tabs = [
    {
      id: "project",
      title: t("tabs.project"),
    },
    {
      id: "team",
      title: t("tabs.team"),
    },
    {
      id: "account",
      title: t("tabs.account"),
    },
    {
      id: "billing",
      title: t("tabs.billing"),
    },
  ];

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full px-4 md:px-8">
      <div className="flex items-center justify-between mb-8 mt-5 max-w-screen-xl">
        <TabsList className="justify-start rounded-none h-auto p-0 bg-transparent space-x-6">
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
      </div>

      <TabsContent value="project">
        <ProjectSettings />
      </TabsContent>

      <TabsContent value="team">
        <TeamSettings />
      </TabsContent>

      <TabsContent value="account">
        <AccountSettings />
      </TabsContent>

      <TabsContent value="billing">
        <BillingSettings />
      </TabsContent>
    </Tabs>
  );
}
