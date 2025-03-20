-- AlterTable
ALTER TABLE "invites" ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "maxAge" INTEGER,
ADD COLUMN     "maxUses" INTEGER,
ADD COLUMN     "uses" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "channelId" TEXT,
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
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "entityType" TEXT NOT NULL,
    "userCount" INTEGER,
    "creatorId" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "scheduled_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread_events" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "appliedTags" TEXT[],
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thread_events_pkey" PRIMARY KEY ("id")
);
