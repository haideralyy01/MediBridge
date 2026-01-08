-- MediBridge Database Schema
-- Complete database setup for all tables and indexes
-- PostgreSQL (NeonTech)

-- ============================================================================
-- USERS TABLE - Core user management
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(500),
  role VARCHAR(50) DEFAULT 'patient',
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON TABLE users IS 'Core user information for patients, doctors, and hospital staff';

-- ============================================================================
-- HEALTH_RECORDS TABLE - Patient health records
-- ============================================================================
CREATE TABLE IF NOT EXISTS health_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  record_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icd11_code VARCHAR(50),
  icd11_title VARCHAR(255),
  diagnosis TEXT,
  symptoms TEXT[],
  medications JSONB,
  test_results JSONB,
  attachments JSONB,
  doctor_name VARCHAR(255),
  hospital_name VARCHAR(255),
  hospital_id INTEGER,
  visit_date DATE,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  verification_status VARCHAR(50) DEFAULT 'pending',
  verification_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for health_records table
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_icd11 ON health_records(icd11_code);
CREATE INDEX IF NOT EXISTS idx_health_records_status ON health_records(status);
CREATE INDEX IF NOT EXISTS idx_health_records_verification_status ON health_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_health_records_hospital_id ON health_records(hospital_id);

COMMENT ON TABLE health_records IS 'Patient health records including diagnoses, test results, and medical documentation';

-- ============================================================================
-- MEDICAL_HISTORY TABLE - Patient medical history
-- ============================================================================
CREATE TABLE IF NOT EXISTS medical_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  condition_name VARCHAR(255) NOT NULL,
  icd11_code VARCHAR(50),
  diagnosed_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for medical_history table
CREATE INDEX IF NOT EXISTS idx_medical_history_user_id ON medical_history(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_history_icd11 ON medical_history(icd11_code);
CREATE INDEX IF NOT EXISTS idx_medical_history_status ON medical_history(status);

COMMENT ON TABLE medical_history IS 'Historical record of patient medical conditions and diagnoses';

-- ============================================================================
-- MEDICATIONS TABLE - Patient medications
-- ============================================================================
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  prescribed_by VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for medications table
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_status ON medications(status);

COMMENT ON TABLE medications IS 'Current and historical medication information for patients';

-- ============================================================================
-- VERIFICATION_LOGS TABLE - Record verification audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_logs (
  id SERIAL PRIMARY KEY,
  record_id INTEGER REFERENCES health_records(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  verification_data JSONB,
  verified_by VARCHAR(255),
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Indexes for verification_logs table
CREATE INDEX IF NOT EXISTS idx_verification_logs_record_id ON verification_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_status ON verification_logs(status);
CREATE INDEX IF NOT EXISTS idx_verification_logs_verified_at ON verification_logs(verified_at);

COMMENT ON TABLE verification_logs IS 'Audit trail for health record verification and approval';

-- ============================================================================
-- ANALYTICS TABLE - Dashboard and user metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL,
  metric_value JSONB NOT NULL,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics table
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date_recorded);

COMMENT ON TABLE analytics IS 'Analytics data for dashboard statistics and metrics';

-- ============================================================================
-- HOSPITALS TABLE - Hospital/healthcare provider management
-- ============================================================================
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  profile_picture TEXT,
  license_number VARCHAR(100),
  specialties TEXT[],
  address TEXT,
  phone VARCHAR(20),
  website VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  active BOOLEAN DEFAULT true
);

-- Indexes for hospitals table
CREATE INDEX IF NOT EXISTS idx_hospitals_email ON hospitals(email);
CREATE INDEX IF NOT EXISTS idx_hospitals_google_id ON hospitals(google_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_active ON hospitals(active);

COMMENT ON TABLE hospitals IS 'Hospital and healthcare provider information for MediBridge system';

-- ============================================================================
-- HOSPITAL_PERMISSIONS TABLE - Role-based access control for hospitals
-- ============================================================================
CREATE TABLE IF NOT EXISTS hospital_permissions (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT ARRAY['read_records', 'create_records', 'verify_records'],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for hospital_permissions table
CREATE INDEX IF NOT EXISTS idx_hospital_permissions_hospital_id ON hospital_permissions(hospital_id);

COMMENT ON TABLE hospital_permissions IS 'Role-based permissions for hospital users';

-- ============================================================================
-- FOREIGN KEY CONSTRAINT FOR HEALTH_RECORDS.HOSPITAL_ID
-- ============================================================================
DO $$ 
BEGIN 
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_records' AND column_name = 'hospital_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'health_records' AND constraint_name = 'fk_health_records_hospital_id'
  ) THEN
    ALTER TABLE health_records 
    ADD CONSTRAINT fk_health_records_hospital_id 
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- TRIGGER - Auto-create hospital permissions
-- ============================================================================
CREATE OR REPLACE FUNCTION create_hospital_permissions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hospital_permissions (hospital_id, permissions)
  VALUES (NEW.id, ARRAY['read_records', 'create_records', 'verify_records']);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_hospital_permissions ON hospitals;
CREATE TRIGGER trigger_create_hospital_permissions
  AFTER INSERT ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION create_hospital_permissions();

-- ============================================================================
-- INITIALIZATION - Set default permissions for existing hospitals
-- ============================================================================
INSERT INTO hospital_permissions (hospital_id, permissions)
SELECT id, ARRAY['read_records', 'create_records', 'verify_records']
FROM hospitals 
WHERE id NOT IN (SELECT hospital_id FROM hospital_permissions)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN health_records.hospital_id IS 'Reference to the hospital that created or manages this record';
COMMENT ON COLUMN hospitals.specialties IS 'Array of medical specialties offered by the hospital';
COMMENT ON COLUMN hospitals.active IS 'Whether the hospital account is active';
COMMENT ON COLUMN hospital_permissions.permissions IS 'Array of permissions granted to hospital users';
