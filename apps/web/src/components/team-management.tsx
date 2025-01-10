"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInviteModal } from "@/hooks/use-invite-modal";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { MoreHorizontal, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

function Members({ searchQuery }: { searchQuery: string }) {
  const t = useI18n();
  const params = useParams();

  const { data: members, isLoading: membersLoading } =
    trpc.organization.getMembers.useQuery({
      organizationId: params.organization as string,
    });

  const filteredMembers = members?.filter((member) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.user.name?.toLowerCase().includes(searchLower) ||
      member.user.email?.toLowerCase().includes(searchLower)
    );
  });

  if (membersLoading) {
    return (
      <div className="border border-border">
        <div className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!filteredMembers?.length) {
    return (
      <div className="border border-border p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
        <h3 className="text-md mb-2 text-sm">
          {t("settings.team.members.noResults")}
        </h3>
        <p className="text-secondary text-xs">
          {t("settings.team.members.tryDifferentSearch")}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border">
      {filteredMembers?.map((member) => (
        <div key={member.id} className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarImage src={member.user.image || undefined} />
              <AvatarFallback>{member.user.name}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm">{member.user.name}</div>
              <div className="text-xs text-secondary">{member.user.email}</div>
            </div>
          </div>
          <div className="text-sm text-secondary">
            {t(
              // @ts-ignore
              `settings.team.members.roles.${member.role?.toLowerCase() ?? "member"}`,
            )}
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function Invites({ searchQuery }: { searchQuery: string }) {
  const t = useI18n();
  const params = useParams();
  const utils = trpc.useUtils();

  const { data: invites, isLoading: invitesLoading } =
    trpc.organization.getInvites.useQuery({
      organizationId: params.organization as string,
    });

  const deleteInviteMutation = trpc.organization.deleteInvite.useMutation({
    onSuccess: () => {
      utils.organization.getInvites.invalidate();

      toast.success(t("settings.team.members.deleteInviteSuccess"));
    },
    onError: () => {
      toast.error(t("settings.team.members.deleteInviteError"));
    },
  });

  const filteredInvites = invites?.filter((invite) => {
    const searchLower = searchQuery.toLowerCase();
    return invite.email.toLowerCase().includes(searchLower);
  });

  if (invitesLoading) {
    return (
      <div className="border border-border">
        <div className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!filteredInvites?.length) {
    return (
      <div className="border border-border p-8 text-center min-h-[500px] flex flex-col items-center justify-center">
        <h3 className="text-md mb-2 text-sm">
          {t("settings.team.members.noPendingInvitations")}
        </h3>
        <p className="text-secondary text-xs">
          {t("settings.team.members.inviteMembers")}
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border">
      {filteredInvites?.map((invite) => (
        <div key={invite.id} className="p-4 flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar>
              <AvatarFallback>{invite.email[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm">{invite.email}</div>
              <div className="text-xs text-secondary">
                {t("settings.team.members.invitedBy", {
                  name: invite.inviter.name,
                })}
              </div>
            </div>
          </div>
          <div className="text-sm text-secondary">
            {t(
              // @ts-ignore
              `settings.team.members.roles.${invite.role?.toLowerCase() ?? "member"}`,
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  deleteInviteMutation.mutate({
                    organizationId: params.organization as string,
                    inviteId: invite.id,
                  });
                }}
              >
                {t("settings.team.members.deleteInvite")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}

export function TeamManagement() {
  const t = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const { setOpen } = useInviteModal();

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

        <div className="flex mt-4 justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={t("settings.team.members.filterPlaceholder")}
              className="pl-9 bg-transparent border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpen(true)} size="sm">
            {t("settings.team.members.invite")}
          </Button>
        </div>

        <TabsContent value="members" className="mt-4">
          <Members searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Invites searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
