import { Worker } from 'bullmq';
import { startWorkers } from './worker-runtime';

const workers = startWorkers();

function registerWorkerEvents(worker: Worker): void {
  const queueName = worker.name;

  worker.on('ready', () => {
    console.info(`Worker connected to Redis (${queueName})`);
  });

  worker.on('error', (error: Error) => {
    console.error(`Worker error (${queueName}):`, error.message);
  });
}

async function shutdown(signal: string): Promise<void> {
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
