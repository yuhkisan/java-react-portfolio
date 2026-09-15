import { describe, expect, it } from "vitest";
import { getDeleteTeamResult } from "../teamDelete";

const teamA = { id: "team-a", name: "Team A" };
const teamB = { id: "team-b", name: "Team B" };

describe("getDeleteTeamResult", () => {
  it("最後のチームは削除不可になる", () => {
    const result = getDeleteTeamResult([teamA], teamA.id);

    expect(result).toEqual({ status: "blocked", reason: "last-team" });
  });

  it("削除可能なら次のチームを返す", () => {
    const result = getDeleteTeamResult([teamA, teamB], teamA.id);

    expect(result.status).toBe("deleted");
    if (result.status === "deleted") {
      expect(result.nextTeams).toEqual([teamB]);
      expect(result.nextTeamId).toBe(teamB.id);
    }
  });
});
