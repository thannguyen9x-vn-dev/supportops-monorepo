// CJS stub for the ESM-only `until-async` package.
// until-async uses "type": "module" which Jest's CJS mode cannot process.
// This stub reimplements the same API in CommonJS format.
"use strict";

async function until(callback) {
  try {
    return [null, await callback().catch((error) => { throw error; })];
  } catch (error) {
    return [error, null];
  }
}

module.exports = { until };
