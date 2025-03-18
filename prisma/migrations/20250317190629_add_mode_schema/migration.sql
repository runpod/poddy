/*
  Warnings:

  - Added the required column `maxAge` to the `invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxUses` to the `invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uses` to the `invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channelId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "maxAge" INTEGER NOT NULL,
ADD COLUMN     "maxUses" INTEGER NOT NULL,
ADD COLUMN     "uses" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "channelId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "editedAt" TIMESTAMP(3),
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "availableTags" TEXT[],
    "appliedTags" TEXT[],

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "targetId" TEXT,
    "actorId" TEXT,
    "actionType" TEXT,
    "changes" JSONB,
    "reason" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bans" (
    "user_id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "reason" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "bans_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "member_events" (
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "leaveAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "member_events_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" BIGINT NOT NULL,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "entityType" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL,
    "creatorId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scheduled_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "appliedTags" TEXT[],
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thread_events_pkey" PRIMARY KEY ("id")
);
