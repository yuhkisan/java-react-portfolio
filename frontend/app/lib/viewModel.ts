import type {
  Project,
  Severity,
  Vulnerability,
  VulnerabilitySummary,
} from "@/app/types/viewModel";
import type { ProjectApiResponse } from "@/app/types/api";

// 重要度文字列をUIの型に変換
const mapSeverity = (severity: string): Severity => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
    default:
      return "Low";
  }
};

const buildSummary = (vulnerabilities: Vulnerability[]): VulnerabilitySummary => {
  const bySeverity: VulnerabilitySummary["bySeverity"] = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  for (const vuln of vulnerabilities) {
    bySeverity[vuln.severity] += 1;
  }

  return {
    total: vulnerabilities.length,
    bySeverity,
  };
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const buildRootDependencyPicker = (
  packages: ProjectApiResponse["packages"],
) => {
  const directPackages = packages.filter((pkg) => pkg.isDirect);
  const directAll = Array.from(
    new Set(directPackages.map((pkg) => pkg.name)),
  );
  const directByType = {
    prod: Array.from(
      new Set(
        directPackages
          .filter((pkg) => pkg.dependencyType === "prod")
          .map((pkg) => pkg.name),
      ),
    ),
    dev: Array.from(
      new Set(
        directPackages
          .filter((pkg) => pkg.dependencyType === "dev")
          .map((pkg) => pkg.name),
      ),
    ),
  };

  return (
    packageName: string,
    dependencyType: ProjectApiResponse["packages"][number]["dependencyType"],
    isDirect: boolean,
  ) => {
    if (isDirect) return packageName;
    const candidates =
      directByType[dependencyType].length > 0
        ? directByType[dependencyType]
        : directAll;
    if (candidates.length === 0) return packageName;
    const index = hashString(`${packageName}:${dependencyType}`) %
      candidates.length;
    return candidates[index];
  };
};

export function convertToProjectViewModel(p: ProjectApiResponse): Project {
  // Project -> Package -> Vulnerability の構造をフラットな Vulnerability 配列に変換
  const pickRootDependency = buildRootDependencyPicker(p.packages);
  const vulnerabilities: Vulnerability[] = p.packages
    .filter((pkg) => pkg.vulnerability)
    .map((pkg) => {
      const v = pkg.vulnerability!;
      return {
        id: v.id,
        packageName: pkg.name,
        version: pkg.version,
        severity: mapSeverity(v.severity),
        dependencyType: pkg.dependencyType,
        rootDependency: pickRootDependency(
          pkg.name,
          pkg.dependencyType,
          pkg.isDirect,
        ),
        cve: v.cve || "N/A",
        description: v.description,
      };
    });

  const summary = buildSummary(vulnerabilities);

  return {
    id: p.id,
    teamId: p.teamId,
    name: p.name,
    fileName: p.fileName,
    uploadDate: new Date(p.uploadDate),
    status: p.status,
    vulnerabilities: vulnerabilities,
    summary,
    pkgCount: p.pkgCount,
    errorMessage: p.errorMessage || undefined,
  };
}
