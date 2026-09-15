import { beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      create: vi.fn(),
    },
  },
}));

type ErrorResponse = { error: string };

let POST: typeof import("../route").POST;

beforeAll(async () => {
  ({ POST } = await import("../route"));
});

const buildRequest = (formData: FormData) =>
  new NextRequest("http://localhost/api/scans", {
    method: "POST",
    body: formData,
  });

const toError = async (response: Response): Promise<ErrorResponse> =>
  (await response.json()) as ErrorResponse;

describe("POST /api/scans", () => {
  it("returns 400 when file or teamId is missing", async () => {
    const formData = new FormData();
    formData.append("teamId", "team-1");

    const response = await POST(buildRequest(formData));
    const body = await toError(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("file and teamId are required");
  });

  it("returns 400 for empty file", async () => {
    const formData = new FormData();
    const file = new File([""], "empty.json", { type: "application/json" });
    formData.append("file", file);
    formData.append("teamId", "team-1");

    const response = await POST(buildRequest(formData));
    const body = await toError(response);

    expect(response.status).toBe(400);
    expect(body.error).toContain("空のファイルです");
  });

  it("returns 413 for oversized file", async () => {
    const formData = new FormData();
    const bigContent = "x".repeat(5 * 1024 * 1024 + 1);
    const file = new File([bigContent], "big.json", {
      type: "application/json",
    });
    formData.append("file", file);
    formData.append("teamId", "team-1");

    const response = await POST(buildRequest(formData));
    const body = await toError(response);

    expect(response.status).toBe(413);
    expect(body.error).toContain("5MBを超えています");
  });

  it("returns 400 for invalid JSON", async () => {
    const formData = new FormData();
    const file = new File(["{ invalid"], "invalid.json", {
      type: "application/json",
    });
    formData.append("file", file);
    formData.append("teamId", "team-1");

    const response = await POST(buildRequest(formData));
    const body = await toError(response);

    expect(response.status).toBe(400);
    expect(body.error).toContain("JSONとして解析できません");
  });
});
