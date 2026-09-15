import { coerce, inc, satisfies } from "semver";
import type { Severity } from "../../types/viewModel";

export type VulnerabilityRule = {
  packageName: string;
  vulnerableRange: string;
  severity: Severity;
  cve: string;
  title: string;
  description: string;
  fixedIn?: string;
  url?: string;
};

const VULNERABILITY_RULES: VulnerabilityRule[] = [
  {
    packageName: "lodash",
    vulnerableRange: "<4.17.21",
    severity: "High",
    cve: "CVE-2020-28500",
    title: "Regular Expression Denial of Service (ReDoS)",
    description:
      "lodash versions prior to 4.17.21 are vulnerable to Regular Expression Denial of Service (ReDoS) via the `toNumber`, `trim` and `trimEnd` functions.",
    fixedIn: "4.17.21",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2020-28500",
  },
  {
    packageName: "axios",
    vulnerableRange: "<0.21.1",
    severity: "High",
    cve: "CVE-2020-28168",
    title: "Server-Side Request Forgery (SSRF)",
    description:
      "axios before 0.21.1 allows attackers to perform Server-Side Request Forgery via a crafted URL.",
    fixedIn: "0.21.1",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2020-28168",
  },
  {
    packageName: "express",
    vulnerableRange: "<4.17.3",
    severity: "Medium",
    cve: "CVE-2022-24999",
    title: "Open Redirect vulnerability",
    description:
      "qs before 6.10.3, as used in Express before 4.17.3, allows attackers to cause prototype pollution.",
    fixedIn: "4.17.3",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-24999",
  },
  {
    packageName: "minimist",
    vulnerableRange: "<1.2.6",
    severity: "Critical",
    cve: "CVE-2021-44906",
    title: "Prototype Pollution",
    description:
      "Minimist <=1.2.5 is vulnerable to Prototype Pollution via file index.js, function setKey() (lines 69-95).",
    fixedIn: "1.2.6",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2021-44906",
  },
  {
    packageName: "json5",
    vulnerableRange: "<2.2.2",
    severity: "High",
    cve: "CVE-2022-46175",
    title: "Prototype Pollution",
    description:
      "JSON5 before 2.2.2 allows Prototype Pollution when parsing JSON5 files with specially crafted input.",
    fixedIn: "2.2.2",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-46175",
  },
  {
    packageName: "qs",
    vulnerableRange: "<6.10.3",
    severity: "High",
    cve: "CVE-2022-24999",
    title: "Prototype Pollution",
    description:
      "qs before 6.10.3 allows attackers to cause prototype pollution via the `allowPrototypes` option.",
    fixedIn: "6.10.3",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-24999",
  },
  {
    packageName: "semver",
    vulnerableRange: "<7.5.2",
    severity: "Medium",
    cve: "CVE-2022-25883",
    title: "Regular Expression Denial of Service (ReDoS)",
    description:
      "semver versions prior to 7.5.2 are vulnerable to Regular Expression Denial of Service (ReDoS).",
    fixedIn: "7.5.2",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-25883",
  },
  {
    packageName: "tar",
    vulnerableRange: "<6.1.11",
    severity: "High",
    cve: "CVE-2021-37701",
    title: "Arbitrary File Overwrite",
    description:
      "The npm package tar (aka node-tar) before versions 6.1.11 has an arbitrary file overwrite vulnerability.",
    fixedIn: "6.1.11",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2021-37701",
  },
  {
    packageName: "glob-parent",
    vulnerableRange: "<5.1.2",
    severity: "High",
    cve: "CVE-2020-28469",
    title: "Regular Expression Denial of Service (ReDoS)",
    description:
      "The package glob-parent before 5.1.2 is vulnerable to Regular Expression Denial of Service (ReDoS).",
    fixedIn: "5.1.2",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2020-28469",
  },
  {
    packageName: "async",
    vulnerableRange: "<2.6.4",
    severity: "High",
    cve: "CVE-2021-43138",
    title: "Prototype Pollution",
    description:
      "In async before 2.6.4, a malicious user can obtain privileges via the mapValues() method.",
    fixedIn: "2.6.4",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2021-43138",
  },
  {
    packageName: "node-fetch",
    vulnerableRange: "<2.6.7",
    severity: "High",
    cve: "CVE-2022-0235",
    title: "Exposure of Sensitive Information",
    description:
      "node-fetch before 2.6.7 allows attackers to expose sensitive information via the Request.clone method.",
    fixedIn: "2.6.7",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-0235",
  },
  {
    packageName: "moment",
    vulnerableRange: "<2.29.4",
    severity: "High",
    cve: "CVE-2022-31129",
    title: "Inefficient Regular Expression Complexity",
    description:
      "moment before 2.29.4 is vulnerable to ReDoS when passing user-provided strings without sanity length checks to moment constructor.",
    fixedIn: "2.29.4",
    url: "https://nvd.nist.gov/vuln/detail/CVE-2022-31129",
  },
  {
    packageName: "react",
    vulnerableRange: "<18.2.0",
    severity: "Low",
    cve: "CVE-2024-10011",
    title: "Information Exposure via Debug Artifacts (Mock)",
    description:
      "Mock advisory: react versions prior to 18.2.0 may expose internal debug artifacts under specific build configurations.",
    fixedIn: "18.2.0",
    url: "https://example.com/security/advisories/CVE-2024-10011",
  },
  {
    packageName: "debug",
    vulnerableRange: "<4.3.4",
    severity: "Medium",
    cve: "CVE-2024-10012",
    title: "Prototype Pollution via Crafted Input (Mock)",
    description:
      "Mock advisory: debug versions prior to 4.3.4 may allow prototype pollution in edge-case input parsing.",
    fixedIn: "4.3.4",
    url: "https://example.com/security/advisories/CVE-2024-10012",
  },
  {
    packageName: "serialize-javascript",
    vulnerableRange: "<6.0.2",
    severity: "High",
    cve: "CVE-2024-10013",
    title: "Cross-Site Scripting (XSS) in Serialization (Mock)",
    description:
      "Mock advisory: serialize-javascript versions prior to 6.0.2 may allow XSS when serializing untrusted data.",
    fixedIn: "6.0.2",
    url: "https://example.com/security/advisories/CVE-2024-10013",
  },
  {
    packageName: "ws",
    vulnerableRange: "<8.13.0",
    severity: "Medium",
    cve: "CVE-2024-10014",
    title: "Denial of Service via Malformed Frames (Mock)",
    description:
      "Mock advisory: ws versions prior to 8.13.0 may be susceptible to DoS with malformed WebSocket frames.",
    fixedIn: "8.13.0",
    url: "https://example.com/security/advisories/CVE-2024-10014",
  },
  {
    packageName: "yargs-parser",
    vulnerableRange: "<21.1.1",
    severity: "Low",
    cve: "CVE-2024-10015",
    title: "Potential Command Injection in Edge Cases (Mock)",
    description:
      "Mock advisory: yargs-parser versions prior to 21.1.1 may allow command injection in rare parsing scenarios.",
    fixedIn: "21.1.1",
    url: "https://example.com/security/advisories/CVE-2024-10015",
  },
  {
    packageName: "uuid",
    vulnerableRange: "<9.0.1",
    severity: "Low",
    cve: "CVE-2024-10016",
    title: "Predictable UUID Generation (Mock)",
    description:
      "Mock advisory: uuid versions prior to 9.0.1 may generate predictable identifiers under certain entropy constraints.",
    fixedIn: "9.0.1",
    url: "https://example.com/security/advisories/CVE-2024-10016",
  },
];

const FALLBACK_VULN_RATE = 35;

const FALLBACK_SEVERITY_WEIGHTS: Array<{ severity: Severity; weight: number }> =
  [
    { severity: "Critical", weight: 5 },
    { severity: "High", weight: 20 },
    { severity: "Medium", weight: 45 },
    { severity: "Low", weight: 30 },
  ];

const FALLBACK_TEMPLATES: Record<
  Severity,
  Array<{ title: string; description: string }>
> = {
  Critical: [
    {
      title: "Remote Code Execution via Crafted Payload",
      description:
        "Mock advisory: {package} {version} may allow remote code execution when handling crafted payloads.",
    },
    {
      title: "Authentication Bypass in Token Validation",
      description:
        "Mock advisory: {package} {version} may allow authentication bypass due to insufficient token validation.",
    },
  ],
  High: [
    {
      title: "SQL Injection in Query Builder",
      description:
        "Mock advisory: {package} {version} may allow SQL injection when untrusted input is passed to query APIs.",
    },
    {
      title: "Server-Side Request Forgery (SSRF)",
      description:
        "Mock advisory: {package} {version} may allow SSRF via crafted URLs.",
    },
  ],
  Medium: [
    {
      title: "Denial of Service via Regular Expression",
      description:
        "Mock advisory: {package} {version} may trigger excessive backtracking with crafted input.",
    },
    {
      title: "Information Disclosure in Error Handling",
      description:
        "Mock advisory: {package} {version} may leak sensitive metadata in error responses.",
    },
  ],
  Low: [
    {
      title: "Potential Log Injection",
      description:
        "Mock advisory: {package} {version} may allow log injection when user input is not sanitized.",
    },
    {
      title: "Weak Default Configuration",
      description:
        "Mock advisory: {package} {version} uses a weak default configuration that may reduce security posture.",
    },
  ],
};

const FALLBACK_REFERENCE_URLS = [
  "https://example.com/security/advisories",
  "https://example.com/security/bulletins",
  "https://example.com/security/notice",
];

const hashString = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const pickFrom = <T,>(seed: number, values: T[]): T =>
  values[seed % values.length];

const pickWeightedSeverity = (seed: number): Severity => {
  const total = FALLBACK_SEVERITY_WEIGHTS.reduce(
    (sum, entry) => sum + entry.weight,
    0,
  );
  const roll = seed % total;
  let cumulative = 0;
  for (const entry of FALLBACK_SEVERITY_WEIGHTS) {
    cumulative += entry.weight;
    if (roll < cumulative) return entry.severity;
  }
  return "Low";
};

const formatTemplate = (
  template: string,
  packageName: string,
  version: string,
) =>
  template
    .replaceAll("{package}", packageName)
    .replaceAll("{version}", version);

const inferFixedIn = (version: string, seed: string) => {
  const coerced = coerce(version);
  if (!coerced) return undefined;
  const bumpCount = (hashString(`${seed}:fix`) % 3) + 1;
  let fixed = coerced.version;
  for (let i = 0; i < bumpCount; i += 1) {
    const next = inc(fixed, "patch");
    if (!next) break;
    fixed = next;
  }
  return fixed;
};

const buildFallbackVulnerability = (
  packageName: string,
  version: string,
): VulnerabilityRule | null => {
  const seed = `${packageName}@${version}`.toLowerCase();
  const roll = hashString(`${seed}:roll`) % 100;
  if (roll >= FALLBACK_VULN_RATE) return null;

  const severity = pickWeightedSeverity(hashString(`${seed}:severity`));
  const template = pickFrom(
    hashString(`${seed}:template:${severity}`),
    FALLBACK_TEMPLATES[severity],
  );
  const cveHash = hashString(`${seed}:cve`);
  const year = 2021 + (cveHash % 5);
  const id = 1000 + (cveHash % 9000);
  const cve = `CVE-${year}-${id}`;
  const fixedIn = inferFixedIn(version, seed);
  const urlBase = pickFrom(hashString(`${seed}:url`), FALLBACK_REFERENCE_URLS);

  return {
    packageName,
    vulnerableRange: fixedIn ? `<${fixedIn}` : "*",
    severity,
    cve,
    title: template.title,
    description: formatTemplate(template.description, packageName, version),
    fixedIn,
    url: `${urlBase}/${cve}`,
  };
};

export function findVulnerabilities(
  packageName: string,
  version: string,
): VulnerabilityRule[] {
  const matched = VULNERABILITY_RULES.filter((rule) => {
    if (rule.packageName !== packageName.toLowerCase()) return false;
    try {
      return satisfies(version, rule.vulnerableRange);
    } catch {
      return false;
    }
  });

  if (matched.length > 0) return matched;

  const fallback = buildFallbackVulnerability(packageName, version);
  return fallback ? [fallback] : [];
}
