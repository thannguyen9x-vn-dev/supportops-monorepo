const http = require("node:http");
const { performance } = require("node:perf_hooks");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/fast") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ route: "fast", at: new Date().toISOString() }));
    return;
  }

  if (url.pathname === "/fib-sync") {
    const n = Number(url.searchParams.get("n") || "42");
    const started = performance.now();
    const value = fibonacci(n);
    const elapsedMs = Number((performance.now() - started).toFixed(2));

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        route: "fib-sync",
        n,
        value,
        elapsedMs,
        note: "This blocks the event loop while computing.",
      }),
    );
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ message: "Try /fast or /fib-sync?n=42" }));
});

server.listen(4001, () => {
  console.log("01-blocking running at http://localhost:4001");
});
