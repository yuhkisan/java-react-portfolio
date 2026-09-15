"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "../types/viewModel";

export const ProjectMenu = ({ project }: { project: Project }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault(); // Link遷移を防ぐ
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setNewName(project.name);
    setIsRenameDialogOpen(true);
    handleClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleClose();
    handleDeleteProject();
  };

  const handleRenameSubmit = () => {
    handleRenameProject();
  };

  // ダイアログクリック時の伝播防止
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleRenameProject = async () => {
    const nextName = newName.trim();
    if (!nextName) {
      toast.error("プロジェクト名を入力してください。");
      return;
    }
    if (nextName === project.name) {
      setIsRenameDialogOpen(false);
      return;
    }
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nextName }),
      });
      const result = await response.json();
      if (!response.ok) {
        const message =
          typeof result?.error === "string"
            ? result.error
            : "名前の変更に失敗しました";
        toast.error(message);
        return;
      }
      toast.success(`名前を「${nextName}」に変更しました`);
      setIsRenameDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("ネットワークエラーが発生しました");
    }
  };

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        const message =
          typeof result?.error === "string"
            ? result.error
            : "削除に失敗しました";
        toast.error(message);
        return;
      }
      toast.success(`「${project.name}」を削除しました`);
      router.refresh();
    } catch {
      toast.error("ネットワークエラーが発生しました");
    }
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuClick}
        sx={{ color: "text.secondary" }}
      >
        <MoreVertical size={20} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <Edit2 size={16} />
          </ListItemIcon>
          <ListItemText primary="名前を変更" />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <Trash2 size={16} color="#d32f2f" />
          </ListItemIcon>
          <ListItemText primary="削除" />
        </MenuItem>
      </Menu>

      {/* onClick, onMouseDownで伝播を止める */}
      <div onClick={handleDialogClick} onMouseDown={handleDialogClick}>
        <Dialog
          open={isRenameDialogOpen}
          onClose={() => setIsRenameDialogOpen(false)}
        >
          <DialogTitle>プロジェクト名を変更</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="プロジェクト名"
              fullWidth
              variant="outlined"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsRenameDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleRenameSubmit} variant="contained">
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};
