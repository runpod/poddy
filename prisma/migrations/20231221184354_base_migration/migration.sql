-- CreateEnum
CREATE TYPE "CommandType" AS ENUM ('TEXT_COMMAND', 'APPLICATION_COMMAND');

-- CreateTable
CREATE TABLE "command_cooldowns" (
    "userId" TEXT NOT NULL,
    "commandName" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "commandType" "CommandType" NOT NULL,

    CONSTRAINT "command_cooldowns_pkey" PRIMARY KEY ("commandName","commandType","userId")
);

-- CreateTable
CREATE TABLE "user_languages" (
    "userId" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "user_languages_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "auto_thread_channels" (
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "threadName" TEXT,

    CONSTRAINT "auto_thread_channels_pkey" PRIMARY KEY ("channelId")
);

-- CreateTable
CREATE TABLE "auto_tag_on_forum_channels" (
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "auto_tag_on_forum_channels_pkey" PRIMARY KEY ("channelId","tagId")
);
