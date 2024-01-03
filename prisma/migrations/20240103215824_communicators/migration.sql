-- CreateTable
CREATE TABLE "new_communicators" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "new_communicators_pkey" PRIMARY KEY ("userId","guildId")
);
