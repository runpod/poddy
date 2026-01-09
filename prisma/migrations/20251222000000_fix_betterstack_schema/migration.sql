-- Fix BetterStack schema to allow multiple channels per incident
-- The old schema used the BetterStack report ID as the primary key,
-- which prevented posting the same incident to multiple channels

-- Step 1: Add new reportId column
ALTER TABLE "better_stack_status_reports" ADD COLUMN "reportId" TEXT;

-- Step 2: Copy existing id values to reportId
UPDATE "better_stack_status_reports" SET "reportId" = "id";

-- Step 3: Make reportId NOT NULL after populating
ALTER TABLE "better_stack_status_reports" ALTER COLUMN "reportId" SET NOT NULL;

-- Step 4: Drop the old primary key constraint
ALTER TABLE "better_stack_status_reports" DROP CONSTRAINT "better_stack_status_reports_pkey";

-- Step 5: Generate new cuid-style IDs for the id column
-- Using gen_random_uuid() as a placeholder since we need unique values
UPDATE "better_stack_status_reports" SET "id" = gen_random_uuid()::text;

-- Step 6: Re-add primary key constraint on the new id
ALTER TABLE "better_stack_status_reports" ADD CONSTRAINT "better_stack_status_reports_pkey" PRIMARY KEY ("id");

-- Step 7: Add unique constraint on (reportId, channelId) to prevent duplicate posts
CREATE UNIQUE INDEX "better_stack_status_reports_reportId_channelId_key" ON "better_stack_status_reports"("reportId", "channelId");



