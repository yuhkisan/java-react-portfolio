"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Sparkles } from "lucide-react";
import { callGeminiAPI, isGeminiMock } from "../../lib/gemini";

export const AiReportButton = ({ projectName }: { projectName: string }) => {
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const handleAiProjectReport = async () => {
    setAiResult("");
    setAiDialogOpen(true);
    setAiLoading(true);
    try {
      const result = await callGeminiAPI(`Project Analysis: ${projectName}`);
      setAiResult(result);
    } catch {
      setAiResult("Error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<Sparkles size={16} />}
        onClick={handleAiProjectReport}
        sx={{
          bgcolor: "secondary.main",
          color: "white",
          fontWeight: "bold",
          boxShadow: 2,
        }}
      >
        AIリスク分析
      </Button>

      <Dialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "secondary.50",
            color: "secondary.main",
          }}
        >
          <Sparkles size={20} />
          <Typography variant="h6" component="div" fontWeight="bold">
            Gemini AI Analysis
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ minHeight: 300, p: 4 }}>
          {isGeminiMock && (
            <Alert severity="info" sx={{ mb: 2 }}>
              APIキー未設定のため、AI解説はモック結果です。
            </Alert>
          )}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            プロジェクト分析レポート: {projectName}
          </Typography>
          {aiLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
                gap: 2,
              }}
            >
              <CircularProgress color="secondary" />
              <Typography color="text.secondary" className="animate-pulse">
                AIが分析中...
              </Typography>
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                bgcolor: "grey.50",
                whiteSpace: "pre-line",
                lineHeight: 1.6,
              }}
            >
              {aiResult.split("\n").map((l, i) => (
                <Typography key={i} paragraph sx={{ mb: 1 }}>
                  {l.startsWith("**") ? (
                    <Box component="span" fontWeight="bold">
                      {l.replace(/\*\*/g, "")}
                    </Box>
                  ) : (
                    l
                  )}
                </Typography>
              ))}
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAiDialogOpen(false)} color="inherit">
            閉じる
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setAiDialogOpen(false)}
          >
            理解しました
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
