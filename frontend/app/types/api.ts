export type ApiErrorResponse = {
  error: string;
};

export type ScanResponse = {
  projectId: string;
  status: "analyzing" | "completed" | "failed";
  vulnerabilityCount: number;
};

export type DependencyType = "prod" | "dev";

export type VulnerabilityApiResponse = {
  id: string;
  severity: string;
  cve: string | null;
  description: string;
};

export type PackageApiResponse = {
  name: string;
  version: string;
  isDirect: boolean;
  dependencyType: DependencyType;
  vulnerability: VulnerabilityApiResponse | null;
};

export type ProjectApiResponse = {
  id: string;
  teamId: string;
  name: string;
  fileName: string;
  uploadDate: string;
  status: "analyzing" | "completed" | "failed";
  pkgCount: number;
  errorMessage?: string | null;
  packages: PackageApiResponse[];
};
