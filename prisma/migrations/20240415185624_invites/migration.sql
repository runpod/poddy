-- CreateTable
CREATE TABLE "invites" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("code")
);
