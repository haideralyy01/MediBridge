import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Create PostgreSQL connection pool for NeonTech
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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

// Database schema is now managed via database-schema.sql file
// All tables and indexes are defined in that file for consistency and maintainability
// To initialize the database, run: psql -d medibridge -f database-schema.sql

// Health check function to verify database connection
const healthCheck = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database health check passed:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

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
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
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
      email,
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
      INSERT INTO medications (user_id, medication_name, dosage, frequency, prescribed_by, start_date, end_date, notes)
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
      "SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [userId]);
    return result.rows;
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
        "SELECT COUNT(*) as count FROM medications WHERE user_id = $1 AND status = 'active'",
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
