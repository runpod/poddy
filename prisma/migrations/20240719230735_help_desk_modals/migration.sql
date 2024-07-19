-- CreateEnum
CREATE TYPE "TextInputStyle" AS ENUM ('SHORT', 'PARAGRAPH');

-- AlterTable
ALTER TABLE "help_desk_options" ADD COLUMN     "channelId" TEXT,
ADD COLUMN     "modalTitle" TEXT;

-- CreateTable
CREATE TABLE "HelpDeskOptionModalComponent" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "style" "TextInputStyle" NOT NULL,
    "required" BOOLEAN NOT NULL,
    "minLength" INTEGER,
    "maxLength" INTEGER,
    "placeholder" TEXT,
    "value" TEXT,
    "helpDeskOptionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "HelpDeskOptionModalComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HelpDeskOptionModalComponent" ADD CONSTRAINT "HelpDeskOptionModalComponent_helpDeskOptionId_fkey" FOREIGN KEY ("helpDeskOptionId") REFERENCES "help_desk_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
