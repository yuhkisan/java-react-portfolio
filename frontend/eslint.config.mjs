import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import unusedImports from "eslint-plugin-unused-imports";
import react from "eslint-plugin-react";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  react.configs.flat["jsx-runtime"],
  {
    plugins: { "unused-imports": unusedImports },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "generated/**",
    "next-env.d.ts",
  ]),
]);
