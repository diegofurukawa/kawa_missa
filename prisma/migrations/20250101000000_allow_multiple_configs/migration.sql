-- Migration: Allow multiple Configs per Tenant
-- Remove unique constraint on tenantId and add createdAt/updatedAt fields

-- Step 1: Add createdAt and updatedAt columns if they don't exist
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Drop the unique constraint on tenantId
DROP INDEX IF EXISTS "Config_tenantId_key";

-- Step 3: Update existing records to have proper timestamps if they don't have them
UPDATE "Config" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "Config" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

