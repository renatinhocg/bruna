-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "google_access_token" TEXT,
ADD COLUMN     "google_refresh_token" TEXT,
ADD COLUMN     "google_token_expiry" TIMESTAMP(3);
