"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { GetTeamsResponse } from "@/lib/queries";
import { useI18n } from "@/locales/client";
import { Check, Plus, Settings } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

export function TeamSelector({ teams }: { teams: GetTeamsResponse }) {
  const t = useI18n();
  const params = useParams();
  const router = useRouter();

  const teamId = params.team;
  const projectSlug = params.project;

  const currentTeam = teams
    ? teams.find((team) => team?.id === teamId) || teams.at(0)
    : null;

  const currentProject = currentTeam?.projects.find(
    (project) => project.slug === projectSlug,
  );

  const [open, setOpen] = React.useState(false);
  const [teamName, setTeamName] = React.useState("");
  const [projectName, setProjectName] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="flex items-center gap-3 uppercase text-xs font-medium">
          <div className="flex items-center gap-2">
            <span>{currentTeam?.name}</span>
            <div className="text-[11px] text-primary rounded-full border border-border px-2.5 py-0.5 capitalize">
              {t("teamSelector.pro")}
            </div>
          </div>
          <span className="text-border text-xl">/</span>
          <span>{currentProject?.name || t("teamSelector.project")}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[480px] h-[240px] p-0" sideOffset={10}>
        <div className="flex divide-x divide-border h-[240px]">
          <div className="flex-1 flex flex-col">
            <div className="p-4 text-xs font-medium text-secondary">
              {t("teamSelector.teams")}
            </div>
            <div className="flex-1 overflow-y-auto">
              {teams.map((team) => (
                <div
                  key={team?.id}
                  className="group flex w-full items-center justify-between p-2 px-4 text-xs hover:bg-muted cursor-default"
                  onClick={() => {
                    router.push(`/${team?.id}/${projectSlug}`);
                    setOpen(false);
                  }}
                >
                  <span>{team?.name}</span>
                  <div className="flex items-center gap-2">
                    <Settings
                      className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity duration-100 absolute z-10 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        router.push(
                          `/${currentTeam?.id}/${projectSlug}/settings?tab=team`,
                        );
                      }}
                    />
                    {currentTeam?.id === team?.id && (
                      <Check className="h-4 w-4 group-hover:opacity-0 transition-opacity duration-100" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 p-2 pb-3 text-xs text-secondary hover:text-primary transition-colors duration-100 border-t border-border"
                >
                  <Plus className="h-4 w-4" />
                  {t("teamSelector.createTeam")}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("teamSelector.createTeamTitle")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      placeholder={t("teamSelector.teamNamePlaceholder")}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    onClick={() => {
                      // Handle team creation
                      setTeamName("");
                      setOpen(false);
                    }}
                  >
                    {t("teamSelector.createTeamButton")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="p-4 text-xs font-medium text-secondary">
              {t("teamSelector.project")}
            </div>
            <div className="flex-1 overflow-y-auto">
              {currentTeam?.projects.map((project) => (
                <button
                  type="button"
                  key={project.id}
                  className="group flex w-full items-center justify-between p-2 px-4 text-xs hover:bg-muted"
                  onClick={() => {
                    router.push(`/${currentTeam?.id}/${project.slug}`);
                    setOpen(false);
                  }}
                >
                  <span>{project.name}</span>
                  <div className="flex items-center gap-2">
                    <Settings
                      className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity duration-100 absolute z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        router.push(
                          `/${currentTeam?.id}/${project.slug}/settings`,
                        );
                      }}
                    />
                    {projectSlug === project.slug && (
                      <Check className="h-4 w-4 group-hover:opacity-0 transition-opacity duration-100" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 p-2 pb-3 text-xs text-secondary hover:text-primary transition-colors duration-100 border-t border-border"
                >
                  <Plus className="h-4 w-4" />
                  {t("teamSelector.addProject")}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t("teamSelector.createProjectTitle")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Input
                      placeholder={t("teamSelector.projectNamePlaceholder")}
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    onClick={() => {
                      // Handle project creation
                      setProjectName("");
                      setOpen(false);
                    }}
                  >
                    {t("teamSelector.createProjectButton")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
