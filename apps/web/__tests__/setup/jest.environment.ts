/**
 * Custom Jest environment: jsdom + Fetch API polyfill for MSW v2
 *
 * Why a custom environment instead of setupFiles?
 *
 * jest-environment-jsdom uses jsdom@20 which lacks the Fetch API
 * (Response, Request, Headers, fetch). MSW v2 requires these globals
 * at module initialization time — before setupFiles even runs.
 *
 * The trick: in this environment class, `globalThis` refers to the
 * REAL Node.js globalThis (not jsdom's window). Node 18+ has the
 * Fetch API built in. We copy those globals onto `this.global`
 * (the jsdom window) DURING environment setup, before any test code loads.
 *
 * Reference: https://mswjs.io/docs/migrations/1.x-to-2.x#requestresponseheaders-are-not-defined
 */

// @ts-expect-error — jest-environment-jsdom may not ship types compatible with the installed @jest/types
import JSDOMEnvironment from "jest-environment-jsdom";

export default class CustomJSDOMEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();

    // Copy Fetch API globals from Node 18+ onto the jsdom window.
    // `globalThis` here is Node's global (the environment class runs in Node scope).
    // `this.global` is the jsdom window object used by the tests.
    // Polyfill Fetch API globals (missing from jsdom@20, available in Node 18+)
    if (typeof this.global.Response === "undefined") {
      const nodeGlobalThis = globalThis as unknown as Record<string, unknown>;

      if (nodeGlobalThis["fetch"]) this.global.fetch = nodeGlobalThis["fetch"] as typeof fetch;
      if (nodeGlobalThis["Request"]) this.global.Request = nodeGlobalThis["Request"] as typeof Request;
      if (nodeGlobalThis["Response"]) this.global.Response = nodeGlobalThis["Response"] as typeof Response;
      if (nodeGlobalThis["Headers"]) this.global.Headers = nodeGlobalThis["Headers"] as typeof Headers;
    }

    // Polyfill TextEncoder / TextDecoder (missing in some jsdom versions)
    if (typeof this.global.TextEncoder === "undefined") {
      const { TextEncoder, TextDecoder } = (await import("node:util")) as typeof import("node:util");
      this.global.TextEncoder = TextEncoder as unknown as typeof TextEncoder;
      this.global.TextDecoder = TextDecoder as unknown as typeof TextDecoder;
    }

    // Polyfill Web Streams API (TransformStream, ReadableStream, WritableStream)
    // Required by @mswjs/interceptors for brotli decompression support
    if (typeof this.global.TransformStream === "undefined") {
      const webStreams = (await import("node:stream/web")) as typeof import("node:stream/web");
      this.global.TransformStream = webStreams.TransformStream as unknown as typeof TransformStream;
      this.global.ReadableStream = webStreams.ReadableStream as unknown as typeof ReadableStream;
      this.global.WritableStream = webStreams.WritableStream as unknown as typeof WritableStream;
    }

    // Polyfill BroadcastChannel (Node 15+, but missing in jsdom@20)
    // Required by MSW v2 for WebSocket interceptor coordination
    if (typeof this.global.BroadcastChannel === "undefined") {
      const { BroadcastChannel } = (await import("node:worker_threads")) as typeof import("node:worker_threads");
      this.global.BroadcastChannel = BroadcastChannel as unknown as typeof globalThis.BroadcastChannel;
    }
  }
}
