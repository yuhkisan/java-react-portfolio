import { beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

type ErrorResponse = { error: string };

let PATCH: typeof import("../[id]/route").PATCH;
let DELETE: typeof import("../[id]/route").DELETE;

beforeAll(async () => {
  ({ PATCH, DELETE } = await import("../[id]/route"));
});

const buildRequest = (method: string, body?: string) =>
  new NextRequest("http://localhost/api/projects/project-1", {
    method,
    body,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  });

const toJson = async <T>(response: Response): Promise<T> =>
  (await response.json()) as T;

describe("PATCH /api/projects/:id", () => {
  it("returns 404 when project does not exist", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(null);

    const response = await PATCH(buildRequest("PATCH", JSON.stringify({ name: "New" })), {
      params: Promise.resolve({ id: "project-1" }),
    });
    const body = await toJson<ErrorResponse>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("project not found");
  });

  it("returns 400 when name is empty", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
      id: "project-1",
    } as never);

    const response = await PATCH(buildRequest("PATCH", JSON.stringify({ name: "   " })), {
      params: Promise.resolve({ id: "project-1" }),
    });
    const body = await toJson<ErrorResponse>(response);

    expect(response.status).toBe(400);
    expect(body.error).toBe("name is required");
  });

  it("updates name when payload is valid", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
      id: "project-1",
    } as never);
    vi.mocked(prisma.project.update).mockResolvedValueOnce({
      id: "project-1",
      name: "Renamed",
    } as never);

    const response = await PATCH(buildRequest("PATCH", JSON.stringify({ name: "Renamed" })), {
      params: Promise.resolve({ id: "project-1" }),
    });
    const body = await toJson<{ id: string; name: string }>(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: "project-1", name: "Renamed" });
  });
});

describe("DELETE /api/projects/:id", () => {
  it("returns 404 when project does not exist", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce(null);

    const response = await DELETE(buildRequest("DELETE"), {
      params: Promise.resolve({ id: "project-1" }),
    });
    const body = await toJson<ErrorResponse>(response);

    expect(response.status).toBe(404);
    expect(body.error).toBe("project not found");
  });

  it("deletes project when it exists", async () => {
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.project.findUnique).mockResolvedValueOnce({
      id: "project-1",
    } as never);
    vi.mocked(prisma.project.delete).mockResolvedValueOnce({
      id: "project-1",
    } as never);

    const response = await DELETE(buildRequest("DELETE"), {
      params: Promise.resolve({ id: "project-1" }),
    });
    const body = await toJson<{ id: string }>(response);

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: "project-1" });
  });
});
