import { headers } from "next/headers";
import { createClient } from "./api";
import { auth } from "./auth";

export const getOrganization = async () => {
  return auth.organization.getFullOrganization({
    fetchOptions: {
      headers: await headers(),
    },
  });
};

export type GetTeamsResponse = Awaited<ReturnType<typeof getTeams>>;

export const getTeams = async () => {
  const client = await createClient();
  const response = await client.teams.$get();

  if (!response.ok) {
    return [];
  }

  const teams = await response.json();

  const teamsAndProjects = await Promise.all(
    teams?.data.map(async (team) => {
      const projects = await client.teams[":teamId"].projects.$get({
        param: {
          teamId: team.id,
        },
      });

      if (!projects.ok) {
        return null;
      }

      const projectsResponse = await projects.json();

      return {
        ...team,
        projects: projectsResponse.data,
      };
    }),
  );

  return teamsAndProjects;
};
