-- CreateEnum
CREATE TYPE "EscalatedType" AS ENUM ('MESSAGE', 'THREAD');

-- CreateTable
CREATE TABLE "zendesk_tickets" (
    "id" INTEGER NOT NULL,
    "escalatedId" TEXT NOT NULL,
    "escalatedById" TEXT NOT NULL,
    "type" "EscalatedType" NOT NULL,

    CONSTRAINT "zendesk_tickets_pkey" PRIMARY KEY ("id")
);
