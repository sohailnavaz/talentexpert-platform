-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showPopup" BOOLEAN NOT NULL DEFAULT false;

