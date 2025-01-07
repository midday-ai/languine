import { getTeams } from "@/lib/queries";
import { TeamSelector } from "./team-selector";

export async function TeamSelectorServer() {
  const teams = await getTeams();

  return <TeamSelector teams={teams} />;
}
