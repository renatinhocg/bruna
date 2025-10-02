/*
  Warnings:

  - You are about to drop the column `autorizado` on the `testes_inteligencia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."resultados_inteligencia" ADD COLUMN     "aprovado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."testes_inteligencia" DROP COLUMN "autorizado";
