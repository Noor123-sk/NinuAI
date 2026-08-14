CREATE TABLE "DataAnalysis" (
  "id" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileType" TEXT,
  "rowCount" INTEGER NOT NULL,
  "columnCount" INTEGER NOT NULL,
  "columns" JSONB NOT NULL,
  "preview" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DataAnalysis_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DataAnalysis_createdAt_idx"
ON "DataAnalysis"("createdAt");
