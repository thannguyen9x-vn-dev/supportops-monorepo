-- CreateTable
CREATE TABLE "SlaPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceTypeCode" TEXT NOT NULL,
    "responseMinutes" INTEGER NOT NULL,
    "resolutionMinutes" INTEGER NOT NULL,
    "escalationAfterMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlaPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTransition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "serviceTypeCode" TEXT NOT NULL,
    "fromStatus" "RequestStatus" NOT NULL,
    "toStatus" "RequestStatus" NOT NULL,
    "allowedRoles" TEXT[] NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowTransition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlaPolicy_tenantId_serviceTypeCode_key" ON "SlaPolicy"("tenantId", "serviceTypeCode");

-- CreateIndex
CREATE INDEX "SlaPolicy_tenantId_isActive_idx" ON "SlaPolicy"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "WorkflowTransition_tenantId_serviceTypeCode_isActive_idx" ON "WorkflowTransition"("tenantId", "serviceTypeCode", "isActive");

-- CreateIndex
CREATE INDEX "WorkflowTransition_tenantId_fromStatus_toStatus_idx" ON "WorkflowTransition"("tenantId", "fromStatus", "toStatus");

-- AddForeignKey
ALTER TABLE "SlaPolicy"
ADD CONSTRAINT "SlaPolicy_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTransition"
ADD CONSTRAINT "WorkflowTransition_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
