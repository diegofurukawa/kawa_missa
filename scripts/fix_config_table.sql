-- Script SQL para aplicar manualmente no banco de dados
-- Remove a constraint UNIQUE de tenantId em Config e adiciona campos de timestamp

-- 1. Adicionar colunas createdAt e updatedAt se não existirem
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Config" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Atualizar registros existentes com timestamps
UPDATE "Config" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "Config" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

-- 3. Remover a constraint UNIQUE de tenantId
DROP INDEX IF EXISTS "Config_tenantId_key";

-- Verificar se a constraint foi removida
-- SELECT * FROM pg_indexes WHERE tablename = 'Config' AND indexname = 'Config_tenantId_key';

