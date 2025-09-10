/*
  Warnings:

  - You are about to drop the column `atualizado_em` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `criado_em` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."usuarios" DROP COLUMN "atualizado_em",
DROP COLUMN "criado_em",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ativo',
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'cliente',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
