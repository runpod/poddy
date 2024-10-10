-- AlterEnum
ALTER TYPE "LogEvent" ADD VALUE 'INCIDENT_CREATED';

-- CreateTable
CREATE TABLE "better_stack_status_reports" (
    "id" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "statusPageId" INTEGER NOT NULL,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "better_stack_status_reports_pkey" PRIMARY KEY ("id")
);
