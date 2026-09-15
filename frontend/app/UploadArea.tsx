import React, { useState, useRef } from "react";
import { Paper, Box, Typography, Button } from "@mui/material";
import { UploadCloud } from "lucide-react";

export const UploadArea = ({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onUpload(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) onUpload(e.dataTransfer.files[0]);
  };

  return (
    <Paper
      variant="outlined"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        p: 6,
        borderStyle: "dashed",
        borderWidth: 2,
        borderRadius: 4,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        borderColor: isDragActive ? "primary.main" : "grey.400",
        bgcolor: isDragActive ? "primary.50" : "grey.50",
        transform: isDragActive ? "scale(1.02)" : "scale(1)",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: isDragActive ? "primary.50" : "action.hover",
        },
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        hidden
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
          color: isDragActive ? "primary.dark" : "primary.main",
        }}
      >
        <UploadCloud size={48} strokeWidth={1.5} />
      </Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: isDragActive ? "primary.dark" : "text.primary",
        }}
      >
        {isDragActive
          ? "ここにファイルをドロップ"
          : "SBOMファイルをアップロード"}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        package-lock.json / package.json（JSON・5MB以下）をドラッグ＆ドロップ
        <br />
        またはクリックして選択してください
      </Typography>
      <Button
        variant="contained"
        size="large"
        disableElevation
        sx={{ pointerEvents: "none" }}
      >
        ファイルを選択
      </Button>
    </Paper>
  );
};
