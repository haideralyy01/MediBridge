-- AlterTable
ALTER TABLE "health_records" ADD COLUMN     "patient_id" VARCHAR(100);

-- CreateIndex
CREATE INDEX "idx_health_records_patient_id" ON "health_records"("patient_id");
