import { prisma } from "@/lib/prisma";
import type { Project } from "@/app/types/viewModel";
import type { ProjectApiResponse } from "@/app/types/api";
import { Prisma } from "../../generated/prisma/client";
import { convertToProjectViewModel } from "./viewModel";

type ProjectWithPackages = Prisma.ProjectGetPayload<{
  include: {
    packages: {
      include: {
        vulnerability: true;
      };
    };
  };
}>;

const toProjectApiResponse = (project: ProjectWithPackages): ProjectApiResponse => ({
  id: project.id,
  teamId: project.teamId,
  name: project.name,
  fileName: project.fileName,
  uploadDate: project.uploadDate.toISOString(),
  status: project.status as ProjectApiResponse["status"],
  pkgCount: project.pkgCount,
  errorMessage: project.errorMessage,
  packages: project.packages.map((pkg) => ({
    name: pkg.name,
    version: pkg.version,
    isDirect: pkg.isDirect,
    dependencyType: pkg.dependencyType as ProjectApiResponse["packages"][number]["dependencyType"],
    vulnerability: pkg.vulnerability
      ? {
          id: pkg.vulnerability.id,
          severity: pkg.vulnerability.severity,
          cve: pkg.vulnerability.cve,
          description: pkg.vulnerability.description,
        }
      : null,
  })),
});

export async function getProjects(teamId?: string): Promise<Project[]> {
  const where = teamId ? { teamId } : {};
  const projects = await prisma.project.findMany({
    where,
    include: {
      packages: {
        include: {
          vulnerability: true,
        },
      },
    },
    orderBy: {
      uploadDate: "desc",
    },
  });

  return projects.map((p) => convertToProjectViewModel(toProjectApiResponse(p)));
}

// 単一プロジェクトを ID で取得
export async function getProjectById(id: string): Promise<Project | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      packages: {
        include: {
          vulnerability: true,
        },
      },
    },
  });

  if (!project) return null;
  return convertToProjectViewModel(toProjectApiResponse(project));
}

export async function getTeams() {
  return await prisma.team.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });
}
