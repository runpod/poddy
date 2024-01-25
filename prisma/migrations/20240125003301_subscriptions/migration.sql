-- CreateTable
CREATE TABLE "subscription_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,

    CONSTRAINT "subscription_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscribed_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,

    CONSTRAINT "subscribed_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_groups_name_key" ON "subscription_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subscribed_users_userId_groupId_key" ON "subscribed_users"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "subscribed_users" ADD CONSTRAINT "subscribed_users_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "subscription_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
