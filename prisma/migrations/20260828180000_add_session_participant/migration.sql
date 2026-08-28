-- CreateTable
CREATE TABLE "SessionParticipant" (
    "id" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "studentId" TEXT,
    "trainerId" TEXT,
    "dailySessionId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "leftAt" TIMESTAMP(3),
    "durationSecs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_dailySessionId_key" ON "SessionParticipant"("dailySessionId");

-- CreateIndex
CREATE INDEX "SessionParticipant_classSessionId_idx" ON "SessionParticipant"("classSessionId");

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

