import { createClient } from "@/lib/api";
import { TeamSelector } from "./team-selector";

export async function TeamSelectorServer() {
  const client = await createClient();
  const response = await client.teams.$get();
  const teams = await response.json();

  const teamsAndProjects = await Promise.all(
    teams.data.map(async (team) => {
      const projects = await client.teams[team.id].projects.$get();
      const projectsResponse = await projects.json();

      return {
        ...team,
        projects: projectsResponse.data,
      };
    }),
  );

  return <TeamSelector teams={teamsAndProjects} />;
}
