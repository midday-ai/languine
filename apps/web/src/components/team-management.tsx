"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/contexts/session";
import { useInviteModal } from "@/hooks/use-invite-modal";
import { useI18n } from "@/locales/client";
import { trpc } from "@/trpc/client";
import { TRPCClientError } from "@trpc/client";
import { MoreHorizontal, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
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
  const router = useRouter();
  const utils = trpc.useUtils();
  const { session } = useSession();

  const { data: members, isLoading: membersLoading } =
    trpc.organization.getMembers.useQuery({
      organizationId: params.organization as string,
    });

  const deleteMemberMutation = trpc.organization.deleteMember.useMutation({
    onSuccess: () => {
      utils.organization.getMembers.invalidate();
      toast.success(t("settings.team.members.removeMemberSuccess"), {
        description: t("settings.team.members.removeMemberSuccessDescription"),
      });
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        if (error.data?.code === "FORBIDDEN") {
          toast.error(t("settings.permissionDenied"), {
            description: t("settings.permissionDeniedDescription"),
          });
        } else if (error.data?.code === "BAD_REQUEST") {
          toast.error(t("settings.badRequest"), {
            description: t("settings.badRequestDescription"),
          });
        } else {
          toast.error(t("settings.error"), {
            description: t("settings.errorDescription"),
          });
        }
      } else {
        toast.error(t("settings.error"), {
          description: t("settings.errorDescription"),
        });
      }
    },
  });

  const leaveMutation = trpc.organization.leave.useMutation({
    onSuccess: () => {
      utils.organization.getAll.invalidate();
      router.push("/login");
    },
    onError: () => {
      toast.error(t("settings.permissionDenied"), {
        description: t("settings.permissionDeniedDescription"),
      });
    },
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
      {filteredMembers?.map((member) => {
        const isCurrentUser = member.user.id === session?.user?.id;

        return (
          <div key={member.id} className="p-4 flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar>
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback className="text-sm">
                  {member.user.name?.charAt(0) || member.user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm">{member.user.name}</div>
                <div className="text-xs text-secondary">
                  {member.user.email}
                </div>
              </div>
            </div>
            <div className="text-sm text-secondary">
              {t(
                // @ts-ignore
                `settings.team.members.roles.${member.role?.toLowerCase() ?? "member"}`,
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isCurrentUser ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        {t("settings.team.members.leaveTeam")}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("settings.team.members.leaveTeamConfirm")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("settings.team.members.leaveTeamDescription")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("settings.team.members.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            leaveMutation.mutate({
                              organizationId: params.organization as string,
                            });
                          }}
                        >
                          {t("settings.team.members.leaveTeam")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        {t("settings.team.members.removeMember")}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("settings.team.members.removeMemberConfirm")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("settings.team.members.removeMemberDescription")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t("settings.team.members.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            deleteMemberMutation.mutate({
                              organizationId: params.organization as string,
                              memberId: member.id,
                            });
                          }}
                        >
                          {t("settings.team.members.removeMember")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    {t("settings.team.members.deleteInvite")}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("settings.team.members.deleteInviteConfirm")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("settings.team.members.deleteInviteDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("settings.team.members.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteInviteMutation.mutate({
                          organizationId: params.organization as string,
                          inviteId: invite.id,
                        });
                      }}
                    >
                      {t("settings.team.members.deleteInvite")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
  const [tab, setTab] = useQueryState("management", {
    defaultValue: "members",
  });

  return (
    <div className="w-full space-y-4 max-w-screen-xl">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
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
