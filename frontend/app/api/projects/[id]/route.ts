import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiErrorResponse } from "@/app/types/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const getProjectId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id ?? "";
};

const getProjectOr404 = async (id: string) => {
  if (!id) return null;
  return await prisma.project.findUnique({ where: { id } });
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const id = await getProjectId(context);
  const project = await getProjectOr404(id);
  if (!project) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "project not found" },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "invalid json body" },
      { status: 400 },
    );
  }

  const name =
    typeof (body as { name?: unknown }).name === "string"
      ? (body as { name: string }).name.trim()
      : "";

  if (!name) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "name is required" },
      { status: 400 },
    );
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { name },
    select: { id: true, name: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const id = await getProjectId(context);
  const project = await getProjectOr404(id);
  if (!project) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "project not found" },
      { status: 404 },
    );
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ id });
}
