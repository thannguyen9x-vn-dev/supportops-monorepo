-- AlterTable
ALTER TABLE "RequestQueue" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SlaPolicy" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WorkflowTransition" ALTER COLUMN "updatedAt" DROP DEFAULT;
