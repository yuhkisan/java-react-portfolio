import type { Team } from "../types/viewModel";

export type DeleteTeamResult =
  | { status: "blocked"; reason: "last-team" }
  | { status: "deleted"; nextTeams: Team[]; nextTeamId: string };

export const getDeleteTeamResult = (
  teams: Team[],
  currentTeamId: string,
): DeleteTeamResult => {
  if (teams.length <= 1) {
    return { status: "blocked", reason: "last-team" };
  }

  const nextTeams = teams.filter((team) => team.id !== currentTeamId);
  const nextTeamId = nextTeams[0]?.id ?? "";

  return { status: "deleted", nextTeams, nextTeamId };
};
