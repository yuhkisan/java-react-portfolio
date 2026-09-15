import { describe, expect, it } from "vitest";

import { convertToProjectViewModel } from "../viewModel";
import type { ProjectApiResponse } from "@/app/types/api";

describe("convertToProjectViewModel", () => {
  it("flattens vulnerabilities and maps severity", () => {
    const input: ProjectApiResponse = {
      id: "project-1",
      teamId: "team-1",
      name: "Sample",
      fileName: "package.json",
      uploadDate: "2025-01-01T00:00:00Z",
      status: "completed",
      pkgCount: 3,
      errorMessage: null,
      packages: [
        {
          name: "left-pad",
          version: "1.3.0",
          dependencyType: "prod",
          isDirect: true,
          vulnerability: {
            id: "vuln-1",
            severity: "HIGH",
            cve: "CVE-2024-0001",
            description: "desc",
          },
        },
        {
          name: "no-vuln",
          version: "2.0.0",
          dependencyType: "dev",
          isDirect: true,
          vulnerability: null,
        },
        {
          name: "legacy",
          version: "0.9.0",
          dependencyType: "dev",
          isDirect: true,
          vulnerability: {
            id: "vuln-2",
            severity: "low",
            cve: null,
            description: "desc2",
          },
        },
      ],
    };

    const result = convertToProjectViewModel(input);

    expect(result.vulnerabilities).toEqual([
      {
        id: "vuln-1",
        packageName: "left-pad",
        version: "1.3.0",
        severity: "High",
        dependencyType: "prod",
        rootDependency: "left-pad",
        cve: "CVE-2024-0001",
        description: "desc",
      },
      {
        id: "vuln-2",
        packageName: "legacy",
        version: "0.9.0",
        severity: "Low",
        dependencyType: "dev",
        rootDependency: "legacy",
        cve: "N/A",
        description: "desc2",
      },
    ]);
    expect(result.summary).toEqual({
      total: 2,
      bySeverity: {
        Critical: 0,
        High: 1,
        Medium: 0,
        Low: 1,
      },
    });
  });

  it("maps null errorMessage to undefined", () => {
    const input: ProjectApiResponse = {
      id: "project-2",
      teamId: "team-2",
      name: "Sample 2",
      fileName: "package-lock.json",
      uploadDate: "2025-01-02T00:00:00Z",
      status: "failed",
      pkgCount: 0,
      errorMessage: null,
      packages: [],
    };

    const result = convertToProjectViewModel(input);

    expect(result.errorMessage).toBeUndefined();
  });
});
