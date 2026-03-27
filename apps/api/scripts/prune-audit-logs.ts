import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const retentionDays = Number.parseInt(process.env.AUDIT_LOG_RETENTION_DAYS ?? '2555', 10);
  if (!Number.isFinite(retentionDays) || retentionDays < 30) {
    throw new Error('AUDIT_LOG_RETENTION_DAYS must be a number >= 30');
  }

  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoff,
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      event: 'audit_logs_pruned',
      deletedCount: result.count,
      retentionDays,
      cutoff: cutoff.toISOString(),
    }),
  );
}

void main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        event: 'audit_logs_prune_failed',
        message: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
