-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "google_id" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "role" VARCHAR(50) DEFAULT 'patient',
    "profile_picture" VARCHAR(500),
    "last_login" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "doctors" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "license_number" VARCHAR(255),
    "specialization" VARCHAR(255),
    "hospital" VARCHAR(255),
    "years_of_experience" INTEGER,
    "experience_years" INTEGER,
    "address" TEXT,
    "phone" VARCHAR(50),
    "website" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "health_records" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "record_type" VARCHAR(100) NOT NULL DEFAULT 'general',
    "title" VARCHAR(255) NOT NULL DEFAULT 'Untitled',
    "description" TEXT,
    "icd11_code" VARCHAR(50),
    "icd11_title" VARCHAR(255),
    "diagnosis" TEXT,
    "symptoms" TEXT[],
    "medications" JSONB,
    "test_results" JSONB,
    "attachments" JSONB,
    "doctor_name" VARCHAR(255),
    "hospital_name" VARCHAR(255),
    "visit_date" DATE,
    "severity" VARCHAR(50),
    "blood_type" VARCHAR(10),
    "allergies" TEXT,
    "medical_history" TEXT,
    "status" VARCHAR(50) DEFAULT 'active',
    "verification_status" VARCHAR(50) DEFAULT 'pending',
    "verification_data" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "medicines" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "medicine_name" VARCHAR(255) NOT NULL,
    "medication_name" VARCHAR(255) NOT NULL DEFAULT 'Unknown',
    "dosage" VARCHAR(100),
    "frequency" VARCHAR(100),
    "prescribed_by" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "notes" TEXT,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "test_records" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "doctor_id" INTEGER,
    "test_name" VARCHAR(255) NOT NULL,
    "test_type" VARCHAR(100),
    "result" VARCHAR(500),
    "normal_range" VARCHAR(100),
    "test_date" DATE,
    "frequency" VARCHAR(100),
    "reason" TEXT,
    "instructions" TEXT,
    "notes" TEXT,
    "status" VARCHAR(50) DEFAULT 'scheduled',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "doctor_visits" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER,
    "doctor_id" INTEGER,
    "visit_date" TIMESTAMP(6) NOT NULL,
    "reason_for_visit" TEXT,
    "diagnosis" TEXT,
    "treatment_plan" TEXT,
    "hospital" VARCHAR(255),
    "status" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "analytics" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "metric_type" VARCHAR(100) NOT NULL,
    "metric_value" JSONB NOT NULL,
    "date_recorded" DATE DEFAULT CURRENT_DATE,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(255) NOT NULL,
    "resource_type" VARCHAR(100),
    "resource_id" INTEGER,
    "details" JSONB,
    "timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_logs" (
    "id" SERIAL NOT NULL,
    "record_id" INTEGER,
    "verification_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "verification_data" JSONB,
    "verified_by" VARCHAR(255),
    "verified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_users_google_id" ON "users"("google_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_user_id_key" ON "doctors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_license_number_key" ON "doctors"("license_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_doctors_user_unique" ON "doctors"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_doctors_license_unique" ON "doctors"("license_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_health_records_user_id" ON "health_records"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_health_records_type" ON "health_records"("record_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_health_records_status" ON "health_records"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_health_records_icd11" ON "health_records"("icd11_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_medicines_user_id" ON "medicines"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_medicines_status" ON "medicines"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_test_records_user_id" ON "test_records"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_test_records_status" ON "test_records"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_analytics_user_id" ON "analytics"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_analytics_type" ON "analytics"("metric_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_analytics_date" ON "analytics"("date_recorded");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_verification_logs_record_id" ON "verification_logs"("record_id");

-- AddForeignKey (with existence checks for existing databases)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_user_id_fkey') THEN
        ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'health_records_user_id_fkey') THEN
        ALTER TABLE "health_records" ADD CONSTRAINT "health_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medicines_user_id_fkey') THEN
        ALTER TABLE "medicines" ADD CONSTRAINT "medicines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'test_records_user_id_fkey') THEN
        ALTER TABLE "test_records" ADD CONSTRAINT "test_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'test_records_doctor_id_fkey') THEN
        ALTER TABLE "test_records" ADD CONSTRAINT "test_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_visits_patient_id_fkey') THEN
        ALTER TABLE "doctor_visits" ADD CONSTRAINT "doctor_visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_visits_doctor_id_fkey') THEN
        ALTER TABLE "doctor_visits" ADD CONSTRAINT "doctor_visits_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analytics_user_id_fkey') THEN
        ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'verification_logs_record_id_fkey') THEN
        ALTER TABLE "verification_logs" ADD CONSTRAINT "verification_logs_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "health_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
