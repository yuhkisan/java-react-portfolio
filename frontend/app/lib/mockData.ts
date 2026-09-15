import type { Vulnerability, Member, Severity } from "../types/viewModel";

export const generateMockVulnerabilities = (count: number): Vulnerability[] => {
  const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
  const dependencyTypes = ["prod", "dev"] as const;
  const packages = [
    "log4j-core",
    "react",
    "lodash",
    "axios",
    "spring-web",
    "jackson-databind",
    "openssl",
  ];
  return Array.from({ length: count }).map((_, i) => {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const dependencyType =
      dependencyTypes[Math.floor(Math.random() * dependencyTypes.length)];
    const pkg = packages[Math.floor(Math.random() * packages.length)];
    return {
      id: `vuln-${i}`,
      packageName: pkg,
      version: `${Math.floor(Math.random() * 5)}.${Math.floor(
        Math.random() * 10,
      )}.${Math.floor(Math.random() * 10)}`,
      severity,
      dependencyType,
      rootDependency: pkg,
      cve: `CVE-202${Math.floor(Math.random() * 4) + 1}-${
        Math.floor(Math.random() * 10000) + 1000
      }`,
      description: `Mock description for vulnerability in ${pkg}. This simulates a security finding.`,
    };
  });
};

export const generateMockMembers = (): Member[] => [
  {
    id: "u1",
    name: "Yamada Taro",
    email: "taro@example.com",
    role: "Admin",
    avatarUrl: "",
  },
  {
    id: "u2",
    name: "Suzuki Hanako",
    email: "hanako@example.com",
    role: "Editor",
    avatarUrl: "",
  },
  {
    id: "u3",
    name: "Tanaka Ken",
    email: "ken@example.com",
    role: "Viewer",
    avatarUrl: "",
  },
];
