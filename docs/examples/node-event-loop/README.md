# Node.js Event Loop Demos

These examples are intentionally small so you can run and observe behavior quickly.

## 1) Blocking CPU on main thread

Run:

```bash
node docs/examples/node-event-loop/01-blocking.js
```

Test in another terminal:

```bash
# Start a heavy CPU request
curl "http://localhost:4001/fib-sync?n=43"

# While it is running, try this:
curl "http://localhost:4001/fast"
```

Observation:
- `/fast` waits until Fibonacci finishes.
- Reason: CPU work runs on the main JS thread and blocks the event loop.

## 2) Offload CPU to worker thread

Run:

```bash
node docs/examples/node-event-loop/02-worker-threads.js
```

Test in another terminal:

```bash
# Start CPU work in worker
curl "http://localhost:4002/fib-worker?n=43"

# While it is running, try this:
curl "http://localhost:4002/fast"
```

Observation:
- `/fast` responds quickly even while Fibonacci is running.
- Reason: CPU work moved to worker thread, main event loop stays responsive.

## 3) Non-blocking I/O

Run:

```bash
node docs/examples/node-event-loop/03-non-blocking-io.js
```

Observation:
- `tick` logs continue while `readFile` is in progress.
- This shows async I/O does not block main thread.

## Practical rule

- I/O-heavy APIs: Node.js does very well.
- CPU-heavy tasks: move to `worker_threads`, queue jobs, or separate services.
