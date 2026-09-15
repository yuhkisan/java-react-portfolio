"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import { UploadCloud } from "lucide-react";

export const HeaderNavLinks = ({
  defaultTeamId,
}: {
  defaultTeamId: string;
}) => {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId") ?? defaultTeamId;
  const projectsHref = teamId ? `/projects?teamId=${teamId}` : "/projects";
  const uploadHref = teamId ? `/?teamId=${teamId}` : "/";

  return (
    <>
      <Link href={projectsHref} style={{ textDecoration: "none" }}>
        <Button color="inherit" sx={{ mr: 2 }}>
          プロジェクト一覧
        </Button>
      </Link>

      <Link href={uploadHref} style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          disableElevation
        >
          新規アップロード
        </Button>
      </Link>
    </>
  );
};
