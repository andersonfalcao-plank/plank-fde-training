import { REQUEST_TEAMS } from "@/features/requests/constants";

export type TeamOption = { value: string; label: string };

const teamOptions: TeamOption[] = REQUEST_TEAMS.map((team) => ({
  value: team,
  label: team,
}));

// Returns the teams that a user can select for a Request.
export function useTeams(): TeamOption[] {
  return teamOptions;
}
