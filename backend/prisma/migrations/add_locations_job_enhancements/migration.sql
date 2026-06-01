-- CreateTable Location
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- AlterTable Job - Add new columns
ALTER TABLE "jobs" ADD COLUMN "slug" TEXT,
ADD COLUMN "salary_min" DECIMAL(10,2),
ADD COLUMN "salary_max" DECIMAL(10,2),
ADD COLUMN "location_id" INTEGER,
ADD COLUMN "start_date" TIMESTAMP(3),
ADD COLUMN "end_date" TIMESTAMP(3),
ADD COLUMN "selection_stages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "accessibility_note" TEXT,
DROP COLUMN "location",
DROP COLUMN "salary";

-- CreateIndex Location
CREATE INDEX "locations_company_id_idx" ON "locations"("company_id");

-- CreateIndex Job
CREATE UNIQUE INDEX "jobs_slug_key" ON "jobs"("slug");
CREATE INDEX "jobs_location_id_idx" ON "jobs"("location_id");
CREATE INDEX "jobs_slug_idx" ON "jobs"("slug");

-- AddForeignKey Location
ALTER TABLE "locations" ADD CONSTRAINT "locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Job
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update Company relation table name if needed
ALTER TABLE "companies" ADD CONSTRAINT "fk_placeholder" CHECK (true); -- placeholder to ensure migration runs
