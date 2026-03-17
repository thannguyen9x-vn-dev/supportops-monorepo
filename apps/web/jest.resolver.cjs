/**
 * Custom Jest resolver to handle pnpm + MSW v2 subpath exports.
 *
 * Problem: MSW v2 uses package.json "exports" for subpath resolution
 * (e.g. "msw/node", "@mswjs/interceptors/ClientRequest"). Jest's default
 * CJS resolver doesn't support subpath exports, causing "Cannot find module" errors.
 *
 * In a pnpm workspace, @mswjs/interceptors is stored next to msw in the
 * pnpm virtual store but is NOT hoisted to apps/web/node_modules. This resolver
 * returns absolute file paths to the CJS builds to bypass both issues.
 */

"use strict";

const path = require("path");
const fs = require("fs");

// Resolve the real path of the msw package (follow the pnpm symlink)
let MSW_PACKAGE_DIR;
try {
  // require.resolve('msw/package.json') gives us the package root
  const mswPkg = require.resolve("msw/package.json");
  MSW_PACKAGE_DIR = path.dirname(mswPkg);
} catch {
  MSW_PACKAGE_DIR = null;
}

// @mswjs/interceptors lives next to msw in the pnpm virtual store
const MSWJS_DIR = MSW_PACKAGE_DIR
  ? path.join(MSW_PACKAGE_DIR, "..", "@mswjs", "interceptors")
  : null;

module.exports = function resolver(moduleName, options) {
  // msw/node → absolute path to CJS build
  if (moduleName === "msw/node" && MSW_PACKAGE_DIR) {
    const mswNodeCjs = path.join(MSW_PACKAGE_DIR, "lib", "node", "index.js");
    if (fs.existsSync(mswNodeCjs)) {
      return mswNodeCjs;
    }
  }

  // @mswjs/interceptors/{SubPath} → absolute path to CJS build
  // Handles: ClientRequest, XMLHttpRequest, fetch
  const interceptorsMatch = /^@mswjs\/interceptors\/(.+)$/.exec(moduleName);
  if (interceptorsMatch && MSWJS_DIR) {
    const subpath = interceptorsMatch[1];
    const cjsFile = path.join(
      MSWJS_DIR,
      "lib",
      "node",
      "interceptors",
      subpath,
      "index.cjs"
    );
    if (fs.existsSync(cjsFile)) {
      return cjsFile;
    }
  }

  return options.defaultResolver(moduleName, options);
};
