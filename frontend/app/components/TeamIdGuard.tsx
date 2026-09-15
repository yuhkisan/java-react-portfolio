"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const TeamIdGuard = ({
  defaultTeamId,
}: {
  defaultTeamId: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!defaultTeamId) return;
    const currentTeamId = searchParams.get("teamId");
    if (currentTeamId) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("teamId", defaultTeamId);
    router.replace(`${pathname}?${params.toString()}`);
  }, [defaultTeamId, pathname, router, searchParams]);

  return null;
};
