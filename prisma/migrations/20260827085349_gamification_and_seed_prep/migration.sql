-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "hoursLogged" DECIMAL(6,1) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBadge" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestAttempt_enrollmentId_idx" ON "TestAttempt"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_key_key" ON "Badge"("key");

-- CreateIndex
CREATE INDEX "StudentBadge_studentId_idx" ON "StudentBadge"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentBadge_studentId_badgeId_key" ON "StudentBadge"("studentId", "badgeId");

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
