import { Suspense } from "react";
import { getTeams } from "../lib/data";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function SettingsPage() {
  const teams = await getTeams();
  const defaultTeamId = teams.length > 0 ? teams[0].id : "";

  return (
    <Suspense fallback={null}>
      <SettingsPageClient teams={teams} defaultTeamId={defaultTeamId} />
    </Suspense>
  );
}
