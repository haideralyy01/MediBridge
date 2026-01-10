import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Create PostgreSQL connection pool
const connectionString = process.env.DATABASE_URL;
const isLocalDb =
  connectionString?.includes("127.0.0.1") ||
  connectionString?.includes("localhost");

const pool = new Pool({
  connectionString,
  // Disable SSL for local Postgres; enable for hosted providers
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on("connect", () => {
  console.log("🗄️  Connected to NeonTech PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

// Ensure required columns exist (lightweight startup migration)
let schemaEnsured = false;
const ensureUsersTableColumns = async () => {
  if (schemaEnsured) return;
  try {
    // First create the users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'patient',
        profile_picture VARCHAR(500),
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // Add any missing columns for existing tables
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500),
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
    `);
    schemaEnsured = true;
    console.log("✅ Users table ensured with all columns/indexes");
  } catch (err) {
    console.error("⚠️  Failed to ensure users table:", err.message || err);
  }
};

// Ensure doctors table exists with required columns
const ensureDoctorsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        license_number VARCHAR(255),
        specialization TEXT,
        address TEXT,
        phone VARCHAR(50),
        website VARCHAR(255),
        description TEXT,
        hospital VARCHAR(255),
        years_of_experience INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add columns if they were missing in older schemas
      ALTER TABLE IF EXISTS doctors
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS website VARCHAR(255),
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS hospital VARCHAR(255),
        ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- Indexes / constraints
      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_user_unique ON doctors(user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_license_unique ON doctors(license_number);
    `);
    console.log("🛠️  Ensured doctors table exists and is up to date");
  } catch (err) {
    console.error("⚠️  Failed to ensure doctors table:", err.message || err);
  }
};

// Ensure health_records table exists with all columns and indexes
const ensureHealthRecordsColumns = async () => {
  try {
    // First create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS health_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        record_type VARCHAR(100) NOT NULL DEFAULT 'general',
        title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
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
        visit_date DATE,
        severity VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        verification_status VARCHAR(50) DEFAULT 'pending',
        verification_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add any missing columns for existing tables
    await pool.query(`
      ALTER TABLE health_records
        ADD COLUMN IF NOT EXISTS record_type VARCHAR(100) NOT NULL DEFAULT 'general',
        ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Untitled',
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS icd11_code VARCHAR(50),
        ADD COLUMN IF NOT EXISTS icd11_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS diagnosis TEXT,
        ADD COLUMN IF NOT EXISTS symptoms TEXT[],
        ADD COLUMN IF NOT EXISTS medications JSONB,
        ADD COLUMN IF NOT EXISTS test_results JSONB,
        ADD COLUMN IF NOT EXISTS attachments JSONB,
        ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS hospital_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS visit_date DATE,
        ADD COLUMN IF NOT EXISTS severity VARCHAR(50),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS verification_data JSONB,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
      CREATE INDEX IF NOT EXISTS idx_health_records_icd11 ON health_records(icd11_code);
      CREATE INDEX IF NOT EXISTS idx_health_records_status ON health_records(status);
    `);
    console.log("✅ Health records table ensured with all columns/indexes");
  } catch (err) {
    console.error("⚠️  Failed to ensure health_records table:", err.message || err);
  }
};

// Ensure medicines table exists and has expected columns
const ensureMedicinesColumns = async () => {
  try {
    // First, create the medicines table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        medicine_name VARCHAR(255) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        prescribed_by VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Drop any foreign key constraint on prescribed_by if it exists (it should be a name, not a FK)
    try {
      await pool.query(`ALTER TABLE medicines DROP CONSTRAINT IF EXISTS medicines_prescribed_by_fkey;`);
    } catch (e) { /* ignore if doesn't exist */ }
    
    // Fix column type if it's wrong (e.g., prescribed_by was INTEGER instead of VARCHAR)
    try {
      await pool.query(`
        ALTER TABLE medicines 
          ALTER COLUMN prescribed_by TYPE VARCHAR(255) USING prescribed_by::VARCHAR(255);
      `);
    } catch (e) { /* ignore if already correct type */ }

    // Add any missing columns (for existing tables)
    await pool.query(`
      ALTER TABLE medicines
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS medicine_name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
        ADD COLUMN IF NOT EXISTS dosage VARCHAR(100),
        ADD COLUMN IF NOT EXISTS frequency VARCHAR(100),
        ADD COLUMN IF NOT EXISTS prescribed_by VARCHAR(255),
        ADD COLUMN IF NOT EXISTS start_date DATE,
        ADD COLUMN IF NOT EXISTS end_date DATE,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS notes TEXT,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
      CREATE INDEX IF NOT EXISTS idx_medicines_status ON medicines(status);
    `);
    console.log("✅ Medicines table ensured with all columns/indexes");
  } catch (err) {
    console.error("⚠️  Failed to ensure medicines table:", err.message || err);
  }
};

// Ensure test_records table exists and has expected columns
const ensureTestRecordsColumns = async () => {
  try {
    // First, create the test_records table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        test_name VARCHAR(255) NOT NULL,
        test_type VARCHAR(100),
        frequency VARCHAR(100),
        reason TEXT,
        instructions TEXT,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add any missing columns (for existing tables)
    await pool.query(`
      ALTER TABLE test_records
        ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS test_name VARCHAR(255) NOT NULL DEFAULT 'Unknown',
        ADD COLUMN IF NOT EXISTS test_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS frequency VARCHAR(100),
        ADD COLUMN IF NOT EXISTS reason TEXT,
        ADD COLUMN IF NOT EXISTS instructions TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'scheduled',
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_test_records_user_id ON test_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_test_records_status ON test_records(status);
    `);
    console.log("✅ Test records table ensured with all columns/indexes");
  } catch (err) {
    console.error("⚠️  Failed to ensure test_records table:", err.message || err);
  }
};

// Ensure analytics table exists
const ensureAnalyticsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(100) NOT NULL,
        metric_value JSONB NOT NULL,
        date_recorded DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(metric_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date_recorded);
    `);
    console.log("✅ Analytics table ensured");
  } catch (err) {
    console.error("⚠️  Failed to ensure analytics table:", err.message || err);
  }
};

// Ensure verification_logs table exists
const ensureVerificationLogsTable = async () => {
  try {
    await pool.query(`
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
      
      CREATE INDEX IF NOT EXISTS idx_verification_logs_record_id ON verification_logs(record_id);
    `);
    console.log("✅ Verification logs table ensured");
  } catch (err) {
    console.error("⚠️  Failed to ensure verification_logs table:", err.message || err);
  }
};

// Ensure audit_logs table exists
const ensureAuditLogsTable = async () => {
  try {
    // First try to rename created_at to timestamp if the old schema exists
    try {
      await pool.query(`ALTER TABLE audit_logs RENAME COLUMN created_at TO timestamp;`);
      console.log("✅ Renamed audit_logs.created_at to timestamp");
    } catch (e) { /* column might not exist or already named timestamp */ }

    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        resource_type VARCHAR(100),
        resource_id VARCHAR(100),
        details JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);`);
    
    // Add timestamp column if missing
    try {
      await pool.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    } catch (e) { /* ignore */ }
    
    // Create timestamp index
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);`);
    } catch (e) { /* ignore */ }
    
    console.log("✅ Audit logs table ensured");
  } catch (err) {
    console.log("ℹ️  Audit logs table exists (may have different schema)");
  }
};

// Kick off schema ensure on startup
ensureUsersTableColumns();
ensureDoctorsTable();
ensureHealthRecordsColumns();
ensureMedicinesColumns();
ensureTestRecordsColumns();
ensureAnalyticsTable();
ensureVerificationLogsTable();
ensureAuditLogsTable();

// Create all database tables
const createTables = async () => {
  // Users table
  const createUsersTable = `
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
    
    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  `;

  // Health Records table
  const createHealthRecordsTable = `
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
      visit_date DATE,
      severity VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      verification_status VARCHAR(50) DEFAULT 'pending',
      verification_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
    CREATE INDEX IF NOT EXISTS idx_health_records_icd11 ON health_records(icd11_code);
    CREATE INDEX IF NOT EXISTS idx_health_records_status ON health_records(status);
  `;

  // Medical History table
  const createMedicalHistoryTable = `
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
    
    CREATE INDEX IF NOT EXISTS idx_medical_history_user_id ON medical_history(user_id);
  `;

  // Medications table
  const createMedicationsTable = `
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
    
    CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
  `;

  // Verification Logs table
  const createVerificationLogsTable = `
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
    
    CREATE INDEX IF NOT EXISTS idx_verification_logs_record_id ON verification_logs(record_id);
  `;

  // Dashboard Analytics table
  const createAnalyticsTable = `
    CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      metric_type VARCHAR(100) NOT NULL,
      metric_value JSONB NOT NULL,
      date_recorded DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(metric_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date_recorded);
  `;

  try {
    await pool.query(createUsersTable);
    console.log("✅ Users table initialized successfully");

    await pool.query(createHealthRecordsTable);
    console.log("✅ Health Records table initialized successfully");

    await pool.query(createMedicalHistoryTable);
    console.log("✅ Medical History table initialized successfully");

    await pool.query(createMedicationsTable);
    console.log("✅ Medications table initialized successfully");

    await pool.query(createVerificationLogsTable);
    console.log("✅ Verification Logs table initialized successfully");

    await pool.query(createAnalyticsTable);
    console.log("✅ Analytics table initialized successfully");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

// Initialize database tables (commented out for now - will be called manually)
// createTables();

// Import and initialize RBAC audit table (commented out for now)
// import("../middleware/rbac.js").then(({ createAuditTable }) => {
//   createAuditTable();
// });

// Database query helper functions
export const db = {
  // Generic query function
  query: async (text, params) => {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log("📊 Executed query", { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error("❌ Database query error:", error);
      throw error;
    }
  },

  // User-specific queries
  findUserByGoogleId: async (googleId) => {
    const query = "SELECT * FROM users WHERE google_id = $1";
    const result = await pool.query(query, [googleId]);
    return result.rows[0];
  },

  findUserByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE LOWER(email) = $1";
    const result = await pool.query(query, [email?.toLowerCase()]);
    return result.rows[0];
  },

  createUser: async (userData) => {
    const { googleId, email, name, profilePicture } = userData;
    const query = `
      INSERT INTO users (google_id, email, name, profile_picture, last_login)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await pool.query(query, [
      googleId,
      email?.toLowerCase(),
      name,
      profilePicture,
    ]);
    return result.rows[0];
  },

  updateUserLogin: async (userId) => {
    const query =
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  // Health Records queries
  createHealthRecord: async (recordData) => {
    const {
      userId,
      recordType,
      title,
      description,
      icd11Code,
      icd11Title,
      diagnosis,
      symptoms,
      medications,
      testResults,
      attachments,
      doctorName,
      hospitalName,
      visitDate,
      severity,
    } = recordData;

    const query = `
      INSERT INTO health_records (
        user_id, record_type, title, description, icd11_code, icd11_title,
        diagnosis, symptoms, medications, test_results, attachments,
        doctor_name, hospital_name, visit_date, severity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      recordType,
      title,
      description,
      icd11Code,
      icd11Title,
      diagnosis,
      symptoms,
      JSON.stringify(medications),
      JSON.stringify(testResults),
      JSON.stringify(attachments),
      doctorName,
      hospitalName,
      visitDate,
      severity,
    ]);
    return result.rows[0];
  },

  getHealthRecordsByUserId: async (userId, limit = 50, offset = 0) => {
    const query = `
      SELECT * FROM health_records 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  },

  getHealthRecordById: async (recordId, userId) => {
    const query = `
      SELECT * FROM health_records 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [recordId, userId]);
    return result.rows[0];
  },

  updateHealthRecord: async (recordId, userId, updateData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(recordId, userId);

    const query = `
      UPDATE health_records 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  deleteHealthRecord: async (recordId, userId) => {
    const query =
      "DELETE FROM health_records WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await pool.query(query, [recordId, userId]);
    return result.rows[0];
  },

  // Medical History queries
  createMedicalHistory: async (historyData) => {
    const { userId, conditionName, icd11Code, diagnosedDate, status, notes } =
      historyData;
    const query = `
      INSERT INTO medical_history (user_id, condition_name, icd11_code, diagnosed_date, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      conditionName,
      icd11Code,
      diagnosedDate,
      status,
      notes,
    ]);
    return result.rows[0];
  },

  getMedicalHistoryByUserId: async (userId) => {
    const query =
      "SELECT * FROM medical_history WHERE user_id = $1 ORDER BY diagnosed_date DESC";
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // Medications queries
  createMedication: async (medicationData) => {
    const {
      userId,
      medicationName,
      dosage,
      frequency,
      prescribedBy,
      startDate,
      endDate,
      notes,
    } = medicationData;
    const query = `
      INSERT INTO medicines (user_id, medicine_name, dosage, frequency, prescribed_by, start_date, end_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      medicationName,
      dosage,
      frequency,
      prescribedBy,
      startDate,
      endDate,
      notes,
    ]);
    return result.rows[0];
  },

  getMedicationsByUserId: async (userId) => {
    const query =
      "SELECT * FROM medicines WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  updateMedication: async (medicationId, userId, updateData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`created_at = created_at`); // keep created_at unchanged
    values.push(medicationId, userId);

    const query = `
      UPDATE medicines 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  deleteMedication: async (medicationId, userId) => {
    const query =
      "DELETE FROM medicines WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await pool.query(query, [medicationId, userId]);
    return result.rows[0];
  },

  // Verification queries
  createVerificationLog: async (logData) => {
    const {
      recordId,
      verificationType,
      status,
      verificationData,
      verifiedBy,
      notes,
    } = logData;
    const query = `
      INSERT INTO verification_logs (record_id, verification_type, status, verification_data, verified_by, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      recordId,
      verificationType,
      status,
      JSON.stringify(verificationData),
      verifiedBy,
      notes,
    ]);
    return result.rows[0];
  },

  // Analytics queries
  createAnalyticsEntry: async (analyticsData) => {
    const { userId, metricType, metricValue, dateRecorded } = analyticsData;
    const query = `
      INSERT INTO analytics (user_id, metric_type, metric_value, date_recorded)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      metricType,
      JSON.stringify(metricValue),
      dateRecorded,
    ]);
    return result.rows[0];
  },

  // Test Records queries
  createTestRecord: async (testData) => {
    const { userId, testName, testType, frequency, reason, instructions, status } = testData;
    const query = `
      INSERT INTO test_records (user_id, test_name, test_type, frequency, reason, instructions, status)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, 'scheduled'))
      RETURNING *
    `;
    const result = await pool.query(query, [
      userId,
      testName,
      testType,
      frequency,
      reason,
      instructions,
      status,
    ]);
    return result.rows[0];
  },

  getTestRecordsByUserId: async (userId) => {
    const query = "SELECT * FROM test_records WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  updateTestRecord: async (testId, userId, updateData) => {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`created_at = created_at`);
    values.push(testId, userId);

    const query = `
      UPDATE test_records 
      SET ${fields.join(", ")} 
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  deleteTestRecord: async (testId, userId) => {
    const query = "DELETE FROM test_records WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await pool.query(query, [testId, userId]);
    return result.rows[0];
  },

  getDashboardStats: async (userId) => {
    const queries = {
      totalRecords:
        "SELECT COUNT(*) as count FROM health_records WHERE user_id = $1",
      recentRecords:
        "SELECT COUNT(*) as count FROM health_records WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'",
      verifiedRecords:
        "SELECT COUNT(*) as count FROM health_records WHERE user_id = $1 AND verification_status = 'verified'",
      activeConditions:
        "SELECT COUNT(*) as count FROM medical_history WHERE user_id = $1 AND status = 'active'",
      activeMedications:
        "SELECT COUNT(*) as count FROM medicines WHERE user_id = $1 AND status = 'active'",
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query, [userId]);
      results[key] = parseInt(result.rows[0].count);
    }

    return results;
  },

  // Close database connection
  close: async () => {
    await pool.end();
    console.log("🔒 Database connection closed");
  },
};

export default db;
