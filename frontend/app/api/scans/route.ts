import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findVulnerabilities } from "@/app/lib/fixtures/vulnDb";
import { parsePackageContentWithErrors } from "./packageParsing";
import type { ApiErrorResponse, ScanResponse } from "@/app/types/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const teamId = formData.get("teamId") as string | null;
    const maxFileSize = 5 * 1024 * 1024;

    if (!file || !teamId) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "file and teamId are required" },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "空のファイルです。依存情報を含む JSON をアップロードしてください。" },
        { status: 400 },
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "ファイルサイズが5MBを超えています。5MB以下にしてください。" },
        { status: 413 },
      );
    }

    const content = await file.text();
    const parseResult = parsePackageContentWithErrors(content);
    const packages = parseResult.packages;

    if (parseResult.error) {
      return NextResponse.json<ApiErrorResponse>(
        { error: parseResult.error.message },
        { status: 400 },
      );
    }

    const projectName = file.name.replace(/\.(json)$/i, "") || "Untitled";

    const project = await prisma.project.create({
      data: {
        name: projectName,
        fileName: file.name,
        teamId,
        status: "completed",
        pkgCount: packages.length,
        packages: {
          create: packages.map((pkg) => {
            const vulns = findVulnerabilities(pkg.name, pkg.version);
            const vuln = vulns[0];

            return {
              name: pkg.name,
              version: pkg.version,
              isDirect: pkg.isDirect,
              dependencyType: pkg.dependencyType,
              ...(vuln && {
                vulnerability: {
                  create: {
                    severity: vuln.severity.toLowerCase(),
                    cve: vuln.cve,
                    title: vuln.title,
                    description: vuln.description,
                    fixedIn: vuln.fixedIn,
                    url: vuln.url,
                  },
                },
              }),
            };
          }),
        },
      },
      include: {
        packages: {
          include: {
            vulnerability: true,
          },
        },
      },
    });

    const vulnerabilityCount = project.packages.filter(
      (p) => p.vulnerability,
    ).length;

    return NextResponse.json<ScanResponse>({
      projectId: project.id,
      status: project.status as ScanResponse["status"],
      vulnerabilityCount,
    });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json<ApiErrorResponse>(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
