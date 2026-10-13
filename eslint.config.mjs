import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 파일 하나에 대표 하나를 default로 내보낸다. 타입은 named export 허용
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration[exportKind='value']",
          message: "default export만 쓴다. 타입은 named export 가능 (docs/conventions.md)",
        },
        {
          selector: "ExportAllDeclaration[exportKind='value']",
          message: "default export만 쓴다. 타입은 named export 가능 (docs/conventions.md)",
        },
      ],
    },
  },
  // Next 특수 파일은 metadata, GET 같은 named export가 필요하다
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": "off" },
  },
  // Prettier와 겹치는 포맷 규칙 끄기 (항상 마지막에)
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
