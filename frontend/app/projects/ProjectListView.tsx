import Link from "next/link";
import { Suspense } from "react";
import { Box, Container, Grid, Typography, Paper, Button } from "@mui/material";
import { UploadCloud } from "lucide-react";
import { getProjects, getTeams } from "../lib/data";
import { HeaderActions } from "./HeaderActions";
import { ProjectCard } from "./ProjectCard";
import { TeamIdGuard } from "../components/TeamIdGuard";

export const ProjectListView = async ({ teamId }: { teamId?: string }) => {
  const [projects, teams] = await Promise.all([getProjects(), getTeams()]);
  const defaultTeamId = teams.length > 0 ? teams[0].id : "";

  // URL で指定されたチームを使用、なければ先頭チームをデフォルトに
  const currentTeam =
    teams.find((t) => t.id === teamId) ??
    (teams.length > 0 ? teams[0] : { id: "unknown", name: "Unknown" });

  const filteredProjects = projects.filter((p) => p.teamId === currentTeam.id);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <TeamIdGuard defaultTeamId={defaultTeamId} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* ヘッダー部分 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {currentTeam.name} のプロジェクト
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredProjects.length} プロジェクト
            </Typography>
          </Box>
          <Suspense fallback={<Box />}>
            <HeaderActions />
          </Suspense>
        </Box>

        {filteredProjects.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Link
                  href={
                    project.status === "completed"
                      ? `/projects/${project.id}?teamId=${currentTeam.id}`
                      : "#"
                  }
                  style={{ textDecoration: "none" }}
                >
                  <ProjectCard project={project} />
                </Link>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* 空の状態 */
          <Paper
            variant="outlined"
            sx={{
              py: 10,
              px: 4,
              textAlign: "center",
              borderRadius: 3,
              borderStyle: "dashed",
              borderColor: "grey.300",
              bgcolor: "grey.50",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: 1,
                color: "primary.main",
              }}
            >
              <UploadCloud size={40} />
            </Box>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              color="text.primary"
            >
              プロジェクトがありません
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, lineHeight: 1.6 }}
            >
              このチーム「{currentTeam.name}
              」にはまだ解析済みのSBOMがありません。
              <br />
              新しいファイルをアップロードして、脆弱性スキャンを開始しましょう。
            </Typography>
            <Link href={`/?teamId=${currentTeam.id}`} style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<UploadCloud size={20} />}
                sx={{ px: 4, py: 1.5 }}
              >
                SBOMをアップロード
              </Button>
            </Link>
          </Paper>
        )}
      </Container>
    </Box>
  );
};
