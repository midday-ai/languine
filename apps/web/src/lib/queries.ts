import { api } from "./api";
import { auth } from "./auth";
import { getCookieHeaders } from "./cookies";

export const getOrganization = async () => {
  const requestHeaders = await getCookieHeaders();

  return auth.organization.getFullOrganization({
    fetchOptions: {
      headers: requestHeaders,
      credentials: "include",
    },
  });
};

export type GetTeamsResponse = Awaited<ReturnType<typeof getTeams>>;

export const getTeams = async () => {
  const response = await api.teams.$get();

  if (!response.ok) {
    return [];
  }

  const teams = await response.json();

  const teamsAndProjects = await Promise.all(
    teams?.data.map(async (team) => {
      const projects = await api.teams[":teamId"].projects.$get({
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
