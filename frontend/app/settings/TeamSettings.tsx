"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Stack,
  Paper,
  TextField,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Settings, Users, Key, Trash2, Mail, XCircle } from "lucide-react";
import type { Team, Member } from "../types/viewModel";
import { generateMockMembers } from "../lib/mockData";

export const TeamSettings = ({
  team,
  onUpdateTeamName,
  onDeleteTeam,
}: {
  team: Team;
  onUpdateTeamName: (name: string) => void;
  onDeleteTeam: () => void;
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [teamName, setTeamName] = useState(team.name);
  const [members, setMembers] = useState(generateMockMembers());
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newMember: Member = {
      id: `u-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "Viewer",
    };
    setMembers([...members, newMember]);
    setInviteEmail("");
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        チーム設定
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        この設定画面はデモ用のモック挙動です。保存/削除/招待/APIキーの変更は実際には反映されません。
      </Alert>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
          <Tab
            label="一般設定"
            icon={<Settings size={16} />}
            iconPosition="start"
          />
          <Tab
            label="メンバー管理"
            icon={<Users size={16} />}
            iconPosition="start"
          />
          <Tab label="API連携" icon={<Key size={16} />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Stack spacing={4}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              チーム名
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                disableElevation
                onClick={() => onUpdateTeamName(teamName)}
                disabled={teamName === team.name}
              >
                保存
              </Button>
            </Box>
          </Paper>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderColor: "error.main", bgcolor: "error.50" }}
          >
            <Typography
              variant="h6"
              color="error"
              gutterBottom
              fontWeight="bold"
            >
              Danger Zone
            </Typography>
            <Typography variant="body2" paragraph>
              このチームを削除すると、すべてのプロジェクトと設定が永久に失われます。この操作は取り消せません。
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={onDeleteTeam}
            >
              チームを削除する
            </Button>
          </Paper>
        </Stack>
      )}

      {tabIndex === 1 && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              メンバーを招待
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                placeholder="colleague@example.com"
                size="small"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={16} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={handleInvite}
              >
                招待
              </Button>
            </Box>
          </Paper>
          <Paper variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell>名前 / メール</TableCell>
                  <TableCell>ロール</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {m.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {m.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={m.role}
                        size="small"
                        variant="outlined"
                        color={m.role === "Admin" ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setMembers(members.filter((x) => x.id !== m.id))
                        }
                      >
                        <XCircle size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {tabIndex === 2 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Key className="text-gray-500" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                API連携
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CI/CDパイプラインからの自動アップロード用キー
              </Typography>
            </Box>
          </Box>
          <TextField
            fullWidth
            value="sk_live_51Mx...MockKey...XYZ"
            disabled
            InputProps={{ endAdornment: <Button size="small">コピー</Button> }}
            sx={{ bgcolor: "grey.50" }}
          />
        </Paper>
      )}
    </Box>
  );
};
