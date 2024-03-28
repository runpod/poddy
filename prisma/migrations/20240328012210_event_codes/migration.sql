-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "codeAmount" INTEGER,
ADD COLUMN     "codeLogChannelId" TEXT;

-- CreateTable
CREATE TABLE "generated_codes" (
    "code" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runpodEmail" TEXT NOT NULL,

    CONSTRAINT "generated_codes_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "generated_codes_runpodEmail_eventId_key" ON "generated_codes"("runpodEmail", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "generated_codes_userId_eventId_key" ON "generated_codes"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "generated_codes" ADD CONSTRAINT "generated_codes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
