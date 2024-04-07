-- CreateEnum
CREATE TYPE "ZapierNotificationType" AS ENUM ('CUSTOMER_SUCCESS', 'SALES');

-- CreateTable
CREATE TABLE "zapier_notifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "ZapierNotificationType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zapier_notifications_pkey" PRIMARY KEY ("id")
);
