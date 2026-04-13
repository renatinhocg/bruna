/*
  Warnings:

  - The values [HOMOLOGACAO,PRODUCAO] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- Criar novo enum com todos os valores
CREATE TYPE "public"."TaskStatus_new" AS ENUM ('PLANEJADO', 'EM_DESENVOLVIMENTO', 'EM_TESTE', 'CONCLUIDO', 'CANCELADO');

-- Atualizar coluna com mapeamento de valores antigos para novos
ALTER TABLE "public"."tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."tasks" ALTER COLUMN "status" TYPE "public"."TaskStatus_new" USING (
  CASE "status"::text
    WHEN 'HOMOLOGACAO' THEN 'EM_TESTE'
    WHEN 'PRODUCAO' THEN 'CONCLUIDO'
    ELSE "status"::text
  END::"public"."TaskStatus_new"
);

-- Renomear enums
ALTER TYPE "public"."TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "public"."TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";

-- Restaurar default
ALTER TABLE "public"."tasks" ALTER COLUMN "status" SET DEFAULT 'PLANEJADO';
COMMIT;
