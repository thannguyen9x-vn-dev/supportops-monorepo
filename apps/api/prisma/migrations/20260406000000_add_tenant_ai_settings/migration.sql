-- CreateTable
CREATE TABLE "TenantAiSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "defaultModel" TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantAiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantAiSettings_tenantId_key" ON "TenantAiSettings"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantAiSettings" ADD CONSTRAINT "TenantAiSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
