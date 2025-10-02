/*
  Warnings:

  - Added the required column `caracteristicas_inteligente` to the `categorias_inteligencia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carreiras_associadas` to the `categorias_inteligencia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."categorias_inteligencia" ADD COLUMN "caracteristicas_inteligente" TEXT NOT NULL DEFAULT '';
ALTER TABLE "public"."categorias_inteligencia" ADD COLUMN "carreiras_associadas" TEXT NOT NULL DEFAULT '';
