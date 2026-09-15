import { Suspense } from "react";
import { getTeams } from "./lib/data";
import { UploadPageClient } from "./UploadPageClient";

export default async function UploadPage() {
  const teams = await getTeams();
  const defaultTeamId = teams.length > 0 ? teams[0].id : "";

  return (
    <Suspense fallback={null}>
      <UploadPageClient teams={teams} defaultTeamId={defaultTeamId} />
    </Suspense>
  );
}
