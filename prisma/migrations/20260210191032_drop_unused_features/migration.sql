/*
  Warnings:

  - You are about to drop the `HelpDeskOptionModalComponent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `help_desk_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `help_desks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscribed_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscription_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `zapier_notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HelpDeskOptionModalComponent" DROP CONSTRAINT "HelpDeskOptionModalComponent_helpDeskOptionId_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_options" DROP CONSTRAINT "help_desk_options_helpDeskId_fkey";

-- DropForeignKey
ALTER TABLE "help_desk_options" DROP CONSTRAINT "help_desk_options_responseId_fkey";

-- DropForeignKey
ALTER TABLE "subscribed_users" DROP CONSTRAINT "subscribed_users_groupId_fkey";

-- DropTable
DROP TABLE "HelpDeskOptionModalComponent";

-- DropTable
DROP TABLE "help_desk_options";

-- DropTable
DROP TABLE "help_desks";

-- DropTable
DROP TABLE "subscribed_users";

-- DropTable
DROP TABLE "subscription_groups";

-- DropTable
DROP TABLE "zapier_notifications";

-- DropEnum
DROP TYPE "TextInputStyle";

-- DropEnum
DROP TYPE "ZapierNotificationType";
