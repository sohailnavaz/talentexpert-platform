-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recordingUrl" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT false;

