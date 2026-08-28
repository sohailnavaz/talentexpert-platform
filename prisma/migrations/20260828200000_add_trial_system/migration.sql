-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "trialEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "trialExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "isFreePreview" BOOLEAN NOT NULL DEFAULT false;

