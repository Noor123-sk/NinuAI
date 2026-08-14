-- AlterTable
ALTER TABLE "Execution"
ADD COLUMN "input" TEXT,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';

-- CreateIndex
CREATE INDEX "Execution_createdAt_idx"
ON "Execution"("createdAt");
