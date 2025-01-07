"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/locales/client";
import { ChevronDown, MoreHorizontal, Search } from "lucide-react";

const members = [
  {
    id: 1,
    name: "Pontus Abrahamsson",
    email: "pontus@lostisland.co",
    role: "Owner",
    avatar: "/placeholder.svg",
  },
];

export default function TeamManagement() {
  const t = useI18n();

  return (
    <div className="w-full space-y-4 max-w-screen-xl">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent space-x-6">
          <TabsTrigger
            value="members"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-2"
          >
            {t("settings.team.members.title")}
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-white data-[state=active]:bg-transparent px-0 py-2"
          >
            {t("settings.team.members.pendingInvitations")}
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={t("settings.team.members.filterPlaceholder")}
              className="pl-9 bg-transparent border-border"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border-border"
              >
                {t("settings.team.members.allRoles")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                {t("settings.team.members.roles.owner")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("settings.team.members.roles.admin")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("settings.team.members.roles.member")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent border-border"
              >
                {t("settings.team.members.date")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                {t("settings.team.members.dateSort.newest")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t("settings.team.members.dateSort.oldest")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="members" className="mt-4">
          <div className="border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-4">
                <Checkbox className="border-border" />
                <span className="text-sm text-secondary">
                  {t("settings.team.members.selectAll", { count: 1 })}
                </span>
                <div className="ml-auto">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {members.map((member) => (
              <div key={member.id} className="p-4 flex items-center gap-4">
                <Checkbox className="border-border" />
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">{member.name}</div>
                    <div className="text-xs text-secondary">{member.email}</div>
                  </div>
                </div>
                <div className="text-sm text-secondary">{member.role}</div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="border border-border p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
            <h3 className="text-md mb-2 text-sm">
              {t("settings.team.members.noPendingInvitations")}
            </h3>
            <p className="text-secondary text-xs">
              {t("settings.team.members.inviteMembers")}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
