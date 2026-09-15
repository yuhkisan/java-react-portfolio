import { describe, expect, it } from "vitest";

import { findVulnerabilities } from "./vulnDb";

describe("findVulnerabilities", () => {
  it("matches known rules by version range", () => {
    const result = findVulnerabilities("lodash", "4.17.20");

    expect(result).toHaveLength(1);
    expect(result[0].cve).toBe("CVE-2020-28500");

    const fixed = findVulnerabilities("lodash", "4.17.21");
    expect(fixed).toHaveLength(0);
  });

  it("returns deterministic fallback data when no rule matches", () => {
    const first = findVulnerabilities("left-pad", "1.3.1");
    const second = findVulnerabilities("left-pad", "1.3.1");

    expect(first).toEqual(second);
    expect(first).toHaveLength(1);

    const vuln = first[0];
    expect(vuln.description).toContain("left-pad");
    expect(vuln.description).toContain("1.3.1");
    expect(vuln.fixedIn).toBeDefined();
    expect(vuln.vulnerableRange).toBe(`<${vuln.fixedIn}`);
  });
});
