import {
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Typography,
  Box,
  Skeleton,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  FileCode,
  CheckCircle,
  Loader2,
  XCircle,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { ProjectMenu } from "./ProjectMenu";

import type { Project } from "../types/viewModel";

export const ProjectCard = ({ project }: { project: Project }) => {
  const isAnalyzing = project.status === "analyzing";
  const isFailed = project.status === "failed";

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.2s",
        borderColor: "rgba(0, 0, 0, 0.12)",
        bgcolor: "white",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
          bgcolor: "rgba(255,255,255,0.8)",
          borderRadius: "50%",
          "&:hover": { bgcolor: "white" },
        }}
      >
        <ProjectMenu project={project} />
      </Box>

      <CardActionArea
        disabled={isAnalyzing || isFailed}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 100,
            bgcolor: isFailed ? "error.50" : "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isFailed ? "error.main" : "grey.500",
          }}
        >
          {isAnalyzing ? (
            <Loader2 className="animate-spin" size={40} />
          ) : isFailed ? (
            <AlertCircle size={40} />
          ) : (
            <FileCode size={40} />
          )}
        </Box>

        <CardContent sx={{ width: "100%", pt: 2, flexGrow: 1 }}>
          <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
            {isAnalyzing ? (
              <Chip
                icon={<Loader2 size={14} className="animate-spin" />}
                label="解析中..."
                color="warning"
                size="small"
                variant="outlined"
              />
            ) : isFailed ? (
              <Chip
                icon={<XCircle size={14} />}
                label="解析失敗"
                color="error"
                size="small"
                variant="filled"
              />
            ) : (
              <Chip
                icon={<CheckCircle size={14} />}
                label="完了"
                color="success"
                size="small"
                variant="outlined"
              />
            )}
            <Typography variant="caption" color="text.secondary">
              {project.uploadDate.toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ width: "100%", mb: 2 }}>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {project.fileName}
            </Typography>
          </Box>

          {isAnalyzing ? (
            <Stack spacing={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
            </Stack>
          ) : isFailed ? (
            <Box sx={{ width: "100%" }}>
              <Typography
                variant="body2"
                color="error"
                sx={{
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  wordBreak: "break-all",
                  lineHeight: 1.5,
                  fontSize: "0.875rem",
                }}
              >
                {project.errorMessage || "ファイル形式が不正です。"}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <Chip
                  size="small"
                  label={`${project.vulnerabilities.length} 脆弱性`}
                  icon={<ShieldAlert size={14} />}
                  sx={{
                    bgcolor: "error.50",
                    color: "error.main",
                    border: "none",
                  }}
                />
                <Chip
                  size="small"
                  label={`${project.pkgCount} パッケージ`}
                  sx={{ bgcolor: "grey.100", border: "none" }}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 0.5, mt: 2 }}>
                {project.vulnerabilities.some(
                  (v) => v.severity === "Critical",
                ) && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "error.main",
                    }}
                    title="Critical"
                  />
                )}
                {project.vulnerabilities.some((v) => v.severity === "High") && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "orange",
                    }}
                    title="High"
                  />
                )}
                {project.vulnerabilities.some(
                  (v) => v.severity === "Medium",
                ) && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "warning.main",
                    }}
                    title="Medium"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
