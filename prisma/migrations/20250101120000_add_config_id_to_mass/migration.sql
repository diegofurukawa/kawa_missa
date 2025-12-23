-- AlterTable
ALTER TABLE "Mass" ADD COLUMN "configId" TEXT;

-- AddForeignKey
ALTER TABLE "Mass" ADD CONSTRAINT "Mass_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Config"("id") ON DELETE SET NULL ON UPDATE CASCADE;

