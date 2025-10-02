/*
  Warnings:

  - Made the column `usuario_id` on table `testes_inteligencia` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."testes_inteligencia" DROP CONSTRAINT "testes_inteligencia_usuario_id_fkey";

-- AlterTable
ALTER TABLE "public"."testes_inteligencia" ADD COLUMN     "autorizado" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "usuario_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."testes_inteligencia" ADD CONSTRAINT "testes_inteligencia_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
