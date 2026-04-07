"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_runtime_1 = require("./worker-runtime");
const workers = (0, worker_runtime_1.startWorkers)();
function registerWorkerEvents(worker) {
    const queueName = worker.name;
    worker.on('ready', () => {
        console.info(`Worker connected to Redis (${queueName})`);
    });
    worker.on('error', (error) => {
        console.error(`Worker error (${queueName}):`, error.message);
    });
}
async function shutdown(signal) {
    console.info(`Worker shutdown requested (${signal})`);
    await Promise.all(workers.map((worker) => worker.close()));
    console.info('Worker shutdown complete');
}
for (const worker of workers) {
    registerWorkerEvents(worker);
}
process.on('SIGINT', () => {
    void shutdown('SIGINT').finally(() => process.exit(0));
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM').finally(() => process.exit(0));
});
//# sourceMappingURL=main.js.map