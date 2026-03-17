const http = require("node:http");
const { Worker } = require("node:worker_threads");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

function runFibInWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "02-fib.worker.js"), {
      workerData: { n },
    });

    worker.once("message", (message) => resolve(message.value));
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/fast") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ route: "fast", at: new Date().toISOString() }));
    return;
  }

  if (url.pathname === "/fib-worker") {
    const n = Number(url.searchParams.get("n") || "42");
    const started = performance.now();
    const value = await runFibInWorker(n);
    const elapsedMs = Number((performance.now() - started).toFixed(2));

    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        route: "fib-worker",
        n,
        value,
        elapsedMs,
        note: "CPU work moved off the main event loop.",
      }),
    );
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ message: "Try /fast or /fib-worker?n=42" }));
});

server.listen(4002, () => {
  console.log("02-worker-threads running at http://localhost:4002");
});
