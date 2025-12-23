-- Migration: Remove Organization and consolidate into Tenant
-- This migration moves all Organization data to Tenant and updates all foreign keys

-- Step 1: Add new columns to Tenant
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "denomination" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "legalName" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "document" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "responsibleName" TEXT;

-- Step 2: Migrate data from Organization to Tenant (if Organization table exists and has data)
-- Copy data from Organization to Tenant based on tenantId
UPDATE "Tenant" 
SET 
  "denomination" = "Organization"."denomination",
  "legalName" = "Organization"."legalName",
  "document" = "Organization"."document",
  "responsibleName" = "Organization"."responsibleName",
  "phone" = COALESCE("Organization"."phone", "Tenant"."phone")
FROM "Organization"
WHERE "Tenant"."id" = "Organization"."tenantId";

-- Step 3: Add tenantId column to Address (will replace organizationId)
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Step 4: Migrate Address data: copy organizationId -> tenantId via Organization table
UPDATE "Address" 
SET "tenantId" = "Organization"."tenantId"
FROM "Organization"
WHERE "Address"."organizationId" = "Organization"."id";

-- Step 5: Drop old foreign key and unique constraint on Address
ALTER TABLE "Address" DROP CONSTRAINT IF EXISTS "Address_organizationId_fkey";
DROP INDEX IF EXISTS "Address_organizationId_key";

-- Step 6: Drop organizationId column from Address
ALTER TABLE "Address" DROP COLUMN IF EXISTS "organizationId";

-- Step 7: Add new unique constraint and foreign key for tenantId on Address
CREATE UNIQUE INDEX IF NOT EXISTS "Address_tenantId_key" ON "Address"("tenantId");
ALTER TABLE "Address" ADD CONSTRAINT "Address_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 8: Add tenantId column to Config
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Step 9: Migrate Config data
UPDATE "Config" 
SET "tenantId" = "Organization"."tenantId"
FROM "Organization"
WHERE "Config"."organizationId" = "Organization"."id";

-- Step 10: Drop old foreign key and unique constraint on Config
ALTER TABLE "Config" DROP CONSTRAINT IF EXISTS "Config_organizationId_fkey";
DROP INDEX IF EXISTS "Config_organizationId_key";

-- Step 11: Drop organizationId column from Config
ALTER TABLE "Config" DROP COLUMN IF EXISTS "organizationId";

-- Step 12: Add new unique constraint and foreign key for tenantId on Config
CREATE UNIQUE INDEX IF NOT EXISTS "Config_tenantId_key" ON "Config"("tenantId");
ALTER TABLE "Config" ADD CONSTRAINT "Config_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 13: Add tenantId column to Mass
ALTER TABLE "Mass" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Step 14: Migrate Mass data
UPDATE "Mass" 
SET "tenantId" = "Organization"."tenantId"
FROM "Organization"
WHERE "Mass"."organizationId" = "Organization"."id";

-- Step 15: Drop old foreign key and unique constraint on Mass
ALTER TABLE "Mass" DROP CONSTRAINT IF EXISTS "Mass_organizationId_fkey";
DROP INDEX IF EXISTS "Mass_organizationId_slug_key";

-- Step 16: Drop organizationId column from Mass
ALTER TABLE "Mass" DROP COLUMN IF EXISTS "organizationId";

-- Step 17: Add new unique constraint and foreign key for tenantId on Mass
CREATE UNIQUE INDEX IF NOT EXISTS "Mass_tenantId_slug_key" ON "Mass"("tenantId", "slug");
ALTER TABLE "Mass" ADD CONSTRAINT "Mass_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 18: Drop Organization table and its foreign key
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_tenantId_fkey";
DROP TABLE IF EXISTS "Organization";

