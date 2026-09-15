export type Severity = "Critical" | "High" | "Medium" | "Low";

export type DependencyType = "prod" | "dev";

export type Vulnerability = {
  id: string;
  packageName: string;
  version: string;
  severity: Severity;
  dependencyType: DependencyType;
  rootDependency: string;
  cve: string;
  description: string;
};

export type VulnerabilitySummary = {
  total: number;
  bySeverity: Record<Severity, number>;
};

export type Team = {
  id: string;
  name: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  avatarUrl?: string;
};

export type Project = {
  id: string;
  teamId: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  status: "analyzing" | "completed" | "failed";
  vulnerabilities: Vulnerability[];
  summary: VulnerabilitySummary;
  pkgCount: number;
  errorMessage?: string;
};
