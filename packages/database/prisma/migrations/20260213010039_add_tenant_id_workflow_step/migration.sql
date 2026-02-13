-- AlterTable
ALTER TABLE "WorkflowStep" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'default-tenant-id';
