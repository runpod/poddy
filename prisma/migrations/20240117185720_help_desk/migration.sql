-- CreateTable
CREATE TABLE "embeds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "embeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_desks" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT,
    "name" TEXT NOT NULL,
    "embedColor" TEXT,
    "messageId" TEXT,

    CONSTRAINT "help_desks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "help_desk_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "description" TEXT,
    "helpDeskId" TEXT NOT NULL,
    "emojiName" TEXT,
    "emojiId" TEXT,
    "emojiAnimated" BOOLEAN,
    "position" INTEGER NOT NULL,

    CONSTRAINT "help_desk_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "embeds_name_guildId_key" ON "embeds"("name", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "help_desks_guildId_name_key" ON "help_desks"("guildId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "help_desk_options_helpDeskId_name_key" ON "help_desk_options"("helpDeskId", "name");

-- AddForeignKey
ALTER TABLE "help_desk_options" ADD CONSTRAINT "help_desk_options_helpDeskId_fkey" FOREIGN KEY ("helpDeskId") REFERENCES "help_desks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "help_desk_options" ADD CONSTRAINT "help_desk_options_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "embeds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
