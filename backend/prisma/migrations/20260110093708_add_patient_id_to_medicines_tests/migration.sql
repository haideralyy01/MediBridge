-- AlterTable
ALTER TABLE "medicines" ADD COLUMN     "patient_id" VARCHAR(100);

-- AlterTable
ALTER TABLE "test_records" ADD COLUMN     "patient_id" VARCHAR(100);

-- CreateIndex
CREATE INDEX "idx_medicines_patient_id" ON "medicines"("patient_id");

-- CreateIndex
CREATE INDEX "idx_test_records_patient_id" ON "test_records"("patient_id");
