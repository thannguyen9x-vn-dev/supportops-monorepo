/**
 * Polyfills for MSW v2 + jest-environment-jsdom compatibility.
 *
 * Problem:
 *   MSW v2 (@mswjs/interceptors) requires Fetch API globals (Response, Request,
 *   Headers, fetch) at module initialization time. However, jest-environment-jsdom@29
 *   uses jsdom@20 which does NOT implement the Fetch API (added in jsdom@21).
 *
 * Solution:
 *   In Node 18+, fetch globals are part of the runtime. We expose them on the global
 *   object so that MSW's modules can access them in the jsdom test environment.
 *
 * This file must run via `setupFiles` (before setupFilesAfterEnv) so the globals
 * are available when jest.setup.ts imports the MSW server.
 */

// In Jest's VM context, even though `global` is jsdom's window, the Node.js
// module system is still running. `process` is the real Node.js process.
// Node 18+ exposes Fetch API globals; we make them available in the test context.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeGlobal: any = global;

if (typeof nodeGlobal.Response === "undefined") {
  // Use Node 22's built-in fetch globals (available on process.env context)
  // These are set on globalThis by Node 18+ but jsdom 20 may have cleared them.
  // Access them through the module scope where they are still available.
  // NOTE: This eval runs in the outer Node.js scope, not the jsdom vm scope.
  const fetchGlobals = (0, eval)("({ fetch, Request, Response, Headers })");
  Object.assign(nodeGlobal, fetchGlobals);
}
