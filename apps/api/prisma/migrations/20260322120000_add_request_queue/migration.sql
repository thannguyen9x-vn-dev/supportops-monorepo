-- CreateTable
CREATE TABLE "RequestQueue" (
    "tenantId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestQueue_pkey" PRIMARY KEY ("tenantId","id")
);

-- CreateIndex
CREATE INDEX "RequestQueue_tenantId_isActive_idx" ON "RequestQueue"("tenantId", "isActive");

-- Backfill queues from existing service requests
INSERT INTO "RequestQueue" ("tenantId", "id", "name")
SELECT DISTINCT sr."tenantId", sr."queueId", sr."queueId"
FROM "ServiceRequest" sr
WHERE sr."queueId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "RequestQueue" rq
    WHERE rq."tenantId" = sr."tenantId"
      AND rq."id" = sr."queueId"
  );

-- CreateIndex
CREATE INDEX "ServiceRequest_tenantId_queueId_idx" ON "ServiceRequest"("tenantId", "queueId");

-- AddForeignKey
ALTER TABLE "RequestQueue"
ADD CONSTRAINT "RequestQueue_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest"
ADD CONSTRAINT "ServiceRequest_tenantId_queueId_fkey"
FOREIGN KEY ("tenantId", "queueId") REFERENCES "RequestQueue"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
