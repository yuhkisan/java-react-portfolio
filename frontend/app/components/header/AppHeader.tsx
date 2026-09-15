import { Suspense } from "react";
import { AppBar, Toolbar, Box } from "@mui/material";
import { getTeams } from "../../lib/data";
import { TeamSelector } from "./TeamSelector";
import { HeaderNavLinks } from "./HeaderNavLinks";

export const AppHeader = async () => {
  const teams = await getTeams();
  const defaultTeamId = teams.length > 0 ? teams[0].id : "";

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}
    >
      <Toolbar>
        {/* チーム選択ドロップダウン */}
        <Suspense fallback={<Box sx={{ width: 200 }} />}>
          <TeamSelector teams={teams} defaultTeamId={defaultTeamId} />
        </Suspense>

        <Box sx={{ flexGrow: 1 }} />

        {/* ナビゲーション */}
        <Suspense fallback={<Box sx={{ width: 240 }} />}>
          <HeaderNavLinks defaultTeamId={defaultTeamId} />
        </Suspense>
      </Toolbar>
    </AppBar>
  );
};
