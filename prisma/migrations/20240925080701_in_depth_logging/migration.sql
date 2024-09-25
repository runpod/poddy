/*
Warnings:

- A unique constraint covering the columns `[escalatedId]` on the table `zendesk_tickets` will be added. If there are existing duplicate values, this will fail.

 */
-- CreateEnum
CREATE TYPE "LogEvent" AS ENUM (
    'MESSAGE_EDITED',
    'MESSAGE_DELETED',
    'CHANNEL_CREATED',
    'CHANNEL_DELETED',
    'CHANNEL_UPDATED',
    'ROLE_CREATED',
    'ROLE_DELETED',
    'ROLE_UPDATED',
    'MEMBER_ROLE_UPDATED',
    'MEMBER_UPDATED',
    'MEMBER_JOINED',
    'MEMBER_LEFT',
    'VOICE_STATE_UPDATE',
    'THREAD_CREATED',
    'THREAD_UPDATED',
    'THREAD_DELETED',
    'INVITE_CREATED',
    'INVITE_DELETED'
);

-- CreateTable
CREATE TABLE
    "log_channels" (
        "guildId" TEXT NOT NULL,
        "channelId" TEXT NOT NULL,
        "event" "LogEvent" NOT NULL,
        CONSTRAINT "log_channels_pkey" PRIMARY KEY ("channelId", "event")
    );

-- CreateTable
CREATE TABLE
    "messages" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "guildId" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "member_joins" (
        "id" TEXT NOT NULL,
        "inviteCode" TEXT,
        "userId" TEXT NOT NULL,
        "guildId" TEXT NOT NULL,
        "joinedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "member_joins_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
-- CREATE UNIQUE INDEX "zendesk_tickets_escalatedId_key" ON "zendesk_tickets" ("escalatedId");