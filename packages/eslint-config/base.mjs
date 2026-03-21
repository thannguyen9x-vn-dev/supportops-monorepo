import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/coverage/**"],
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/packages/types/src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@supportops/ui",
            "@supportops/ui-*",
            "@supportops/web",
            "@supportops/api",
            "@supportops/worker",
            "**/apps/**",
          ],
        },
      ],
    },
  },
  {
    files: ["**/packages/ui/src/**/*.{ts,tsx,js,jsx}", "**/packages/ui/*/src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@supportops/web", "@supportops/api", "@supportops/worker", "**/apps/**"],
        },
      ],
    },
  },
  {
    files: ["**/apps/api/src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@supportops/web", "**/apps/web/**"],
        },
      ],
    },
  },
  {
    files: ["**/apps/worker/src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@supportops/web", "**/apps/web/**"],
        },
      ],
    },
  },
];
