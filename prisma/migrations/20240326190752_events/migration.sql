-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("userId","eventId")
);

-- CreateTable
CREATE TABLE "SubmissionUpvote" (
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "SubmissionUpvote_pkey" PRIMARY KEY ("userId","submissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_name_guildId_key" ON "Event"("name", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_messageId_key" ON "Submission"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionUpvote_userId_eventId_key" ON "SubmissionUpvote"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionUpvote" ADD CONSTRAINT "SubmissionUpvote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("messageId") ON DELETE CASCADE ON UPDATE CASCADE;
