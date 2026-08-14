-- AlterTable
ALTER TABLE "Workflow"
ADD COLUMN "instructions" TEXT,
ADD COLUMN "nextRunAt" TIMESTAMP(3),
ADD COLUMN "scheduleType" TEXT,
ADD COLUMN "webhookEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "webhookToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_webhookToken_key"
ON "Workflow"("webhookToken");
