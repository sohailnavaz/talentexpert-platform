-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "batchId" TEXT;

-- CreateIndex
CREATE INDEX "Announcement_batchId_idx" ON "Announcement"("batchId");

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

