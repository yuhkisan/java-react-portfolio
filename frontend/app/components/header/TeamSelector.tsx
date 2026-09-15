"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ShieldAlert, Check, ChevronDown } from "lucide-react";
import type { Team } from "../../types/viewModel";

export const TeamSelector = ({
  teams,
  defaultTeamId,
}: {
  teams: Team[];
  defaultTeamId: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // URL から teamId を取得、なければデフォルト
  const currentTeamId = searchParams.get("teamId") ?? defaultTeamId;
  const currentTeam = teams.find((t) => t.id === currentTeamId) ?? teams[0];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectTeam = (teamId: string) => {
    handleClose();
    router.push(`/projects?teamId=${teamId}`);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 0.5,
              borderRadius: 1,
              display: "flex",
            }}
          >
            <ShieldAlert size={18} />
          </Box>
        }
        endIcon={<ChevronDown size={16} />}
        sx={{
          mr: 2,
          textTransform: "none",
          color: "text.primary",
          fontWeight: "bold",
          fontSize: "1rem",
          maxWidth: 300,
        }}
      >
        <Box sx={{ textAlign: "left", overflow: "hidden" }}>
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            lineHeight={1}
          >
            Team
          </Typography>
          <Typography noWrap>{currentTeam?.name ?? "Unknown"}</Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { maxHeight: 400, minWidth: 200 },
        }}
      >
        {teams.map((team) => (
          <MenuItem
            key={team.id}
            onClick={() => handleSelectTeam(team.id)}
            selected={team.id === currentTeamId}
          >
            <ListItemText primary={team.name} />
            {team.id === currentTeamId && (
              <ListItemIcon sx={{ minWidth: "auto", ml: 1 }}>
                <Check size={16} />
              </ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
