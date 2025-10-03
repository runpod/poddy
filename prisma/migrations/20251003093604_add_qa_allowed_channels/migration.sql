-- CreateTable
CREATE TABLE "qa_allowed_channels" (
    "channel_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_allowed_channels_pkey" PRIMARY KEY ("channel_id")
);
