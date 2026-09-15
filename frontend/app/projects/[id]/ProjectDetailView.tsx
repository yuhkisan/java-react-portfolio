import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Breadcrumbs,
  Stack,
  Chip,
} from "@mui/material";
import { FileCode, ChevronRight, Home } from "lucide-react";
import { getProjectById, getTeams } from "@/app/lib/data";
import { VulnerabilitySection } from "./VulnerabilitySection";
import { AiReportButton } from "./AiReportButton";
import { VulnerabilitySummaryCard } from "./VulnerabilitySummaryCard";
import { TeamIdGuard } from "@/app/components/TeamIdGuard";

export const ProjectDetailView = async ({
  projectId,
}: {
  projectId: string;
}) => {
  // データ取得
  const [project, teams] = await Promise.all([
    getProjectById(projectId),
    getTeams(),
  ]);

  if (!project) {
    notFound();
  }

  const currentTeam = teams.find((t) => t.id === project.teamId) ??
    teams[0] ?? { id: "", name: "Unknown" };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 8 }}>
      <TeamIdGuard defaultTeamId={project.teamId} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* パンくずリスト */}
        <Breadcrumbs separator={<ChevronRight size={16} />} sx={{ mb: 2 }}>
          <Link
            href={`/projects?teamId=${project.teamId}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Home size={16} style={{ marginRight: 4 }} />
              {currentTeam.name}
            </Box>
          </Link>
          <Typography color="text.primary" fontWeight="bold">
            {project.name}
          </Typography>
        </Breadcrumbs>

        {/* プロジェクトヘッダー */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                }}
              >
                <FileCode size={32} />
              </Box>
            </Grid>
            <Grid size="grow">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 0.5,
                }}
              >
                <Typography variant="h4" fontWeight="bold">
                  {project.name}
                </Typography>
                <Chip
                  size="small"
                  label={currentTeam.name}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                ファイル名: {project.fileName} | アップロード:{" "}
                {project.uploadDate.toLocaleString()}
              </Typography>
            </Grid>
            <Grid>
              <Stack direction="row" spacing={2} alignItems="center">
                <AiReportButton projectName={project.name} />
                <Divider orientation="vertical" flexItem />
                <Chip
                  label={`${project.vulnerabilities.length} 件の脆弱性`}
                  color="error"
                  variant="filled"
                  sx={{ fontSize: "1rem", py: 2, fontWeight: "bold" }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <VulnerabilitySummaryCard summary={project.summary} />

        {/* 脆弱性セクション (Client Component) */}
        <VulnerabilitySection vulnerabilities={project.vulnerabilities} />
      </Container>
    </Box>
  );
};
