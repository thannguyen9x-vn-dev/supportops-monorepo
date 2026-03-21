import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./"
});

const config: Config = {
  displayName: "web",
  // Custom test environment: extends jsdom with Fetch API polyfills required by MSW v2.
  // jest-environment-jsdom@29 uses jsdom@20 which lacks Response/Request/Headers/fetch.
  testEnvironment: "<rootDir>/__tests__/setup/jest.environment.ts",
  // Custom resolver to handle pnpm + MSW v2 subpath exports (msw/node, @mswjs/interceptors/*)
  resolver: "<rootDir>/jest.resolver.cjs",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@supportops/types$": "<rootDir>/../../packages/types/src",
    "^@supportops/ui$": "<rootDir>/../../packages/ui/src",
    "^@supportops/ui-theme$": "<rootDir>/../../packages/ui/theme/src",
    "^@supportops/ui-form$": "<rootDir>/../../packages/ui/form/src",
    "^@supportops/ui-avatar$": "<rootDir>/../../packages/ui/avatar/dist",
    "^@supportops/ui-file-upload$": "<rootDir>/../../packages/ui/file-upload/dist",
    // until-async is ESM-only ("type": "module") which Jest's CJS mode cannot process.
    // Map it to a CJS stub with the same API to avoid "Unexpected token 'export'" errors.
    "^until-async$": "<rootDir>/__tests__/mocks/until-async.js",
  },
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}", "<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/.next/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/error.tsx"
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80
    }
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["@swc/jest", {}]
  }
};

export default createJestConfig(config);
