-- AlterTable
ALTER TABLE "Article" ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourceName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Article_sourceUrl_key" ON "Article"("sourceUrl");

-- CreateTable
CREATE TABLE "NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "categoryId" TEXT,
    "fetchIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxItemsPerRun" INTEGER NOT NULL DEFAULT 5,
    "autoPublish" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchedAt" TIMESTAMP(3),
    "lastItemAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestLog" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "itemsFound" INTEGER NOT NULL DEFAULT 0,
    "itemsImported" INTEGER NOT NULL DEFAULT 0,
    "itemsSkipped" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "HarvestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsSource_enabled_idx" ON "NewsSource"("enabled");

-- CreateIndex
CREATE INDEX "NewsSource_categoryId_idx" ON "NewsSource"("categoryId");

-- CreateIndex
CREATE INDEX "HarvestLog_sourceId_idx" ON "HarvestLog"("sourceId");

-- CreateIndex
CREATE INDEX "HarvestLog_startedAt_idx" ON "HarvestLog"("startedAt");

-- AddForeignKey
ALTER TABLE "NewsSource" ADD CONSTRAINT "NewsSource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
