/*
  Warnings:

  - You are about to drop the column `google_access_token` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `google_refresh_token` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `google_token_expiry` on the `usuarios` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."usuarios" DROP COLUMN "google_access_token",
DROP COLUMN "google_refresh_token",
DROP COLUMN "google_token_expiry";

-- CreateTable
CREATE TABLE "public"."google_accounts" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expiry" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "google_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_accounts_email_userId_key" ON "public"."google_accounts"("email", "userId");

-- AddForeignKey
ALTER TABLE "public"."google_accounts" ADD CONSTRAINT "google_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
