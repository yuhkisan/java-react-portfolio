import { describe, expect, it } from "vitest";

import { parsePackageContent, parsePackageContentWithErrors } from "../packageParsing";

type ParsedPackage = ReturnType<typeof parsePackageContent>[number];

const sortPackages = (packages: ParsedPackage[]) =>
  packages
    .slice()
    .sort(
      (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
    );

describe("parsePackageContent", () => {
  it("parses package.json dependencies", () => {
    const content = JSON.stringify({
      dependencies: {
        "left-pad": "^1.3.0",
        lodash: "4.17.21",
      },
      devDependencies: {
        typescript: "~5.2.0",
        invalid: "not-a-version",
      },
    });

    const result = parsePackageContent(content);

    expect(sortPackages(result)).toEqual(
      sortPackages([
        {
          name: "left-pad",
          version: "1.3.0",
          isDirect: true,
          dependencyType: "prod",
        },
        {
          name: "lodash",
          version: "4.17.21",
          isDirect: true,
          dependencyType: "prod",
        },
        {
          name: "typescript",
          version: "5.2.0",
          isDirect: true,
          dependencyType: "dev",
        },
      ]),
    );
  });

  it("parses package-lock v3 without name fields", () => {
    const content = JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": {
          name: "root",
          dependencies: {
            "left-pad": "^1.3.0",
          },
          devDependencies: {
            "@scope/pkg": "^2.0.0",
          },
        },
        "node_modules/left-pad": {
          version: "1.3.0",
        },
        "node_modules/@scope/pkg": {
          version: "2.1.0",
          dev: true,
        },
        "node_modules/left-pad/node_modules/sub": {
          version: "0.1.0",
          dev: true,
        },
      },
    });

    const result = parsePackageContent(content);

    expect(sortPackages(result)).toEqual(
      sortPackages([
        {
          name: "left-pad",
          version: "1.3.0",
          isDirect: true,
          dependencyType: "prod",
        },
        {
          name: "@scope/pkg",
          version: "2.1.0",
          isDirect: true,
          dependencyType: "dev",
        },
        {
          name: "sub",
          version: "0.1.0",
          isDirect: false,
          dependencyType: "dev",
        },
      ]),
    );
  });

  it("returns empty for invalid JSON", () => {
    expect(parsePackageContent("{invalid")).toEqual([]);
  });

  it("reports invalid JSON errors", () => {
    const result = parsePackageContentWithErrors("{invalid");
    expect(result.error?.code).toBe("invalid_json");
  });

  it("reports empty file errors", () => {
    const result = parsePackageContentWithErrors("   ");
    expect(result.error?.code).toBe("empty");
  });

  it("reports unsupported lockfile versions", () => {
    const result = parsePackageContentWithErrors(
      JSON.stringify({ lockfileVersion: 1 }),
    );
    expect(result.error?.code).toBe("unsupported_format");
  });
});
