// Test Database Connection and Backend Functionality
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

async function testDatabase() {
  console.log("🔍 Testing MediBridge Database Connection...\n");

  // Create a test connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  try {
    // Test basic connection
    console.log("1. Testing database connection...");
    const connectionTest = await pool.query(
      "SELECT NOW() as current_time, version()"
    );
    console.log("✅ Database connected successfully");
    console.log(`   Time: ${connectionTest.rows[0].current_time}`);
    console.log(
      `   Version: ${connectionTest.rows[0].version.split(" ")[0]}\n`
    );

    // Check if tables exist
    console.log("2. Checking database schema...");
    const tablesQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const tables = await pool.query(tablesQuery);

    if (tables.rows.length === 0) {
      console.log(
        "⚠️  No tables found. You need to run the backend server first to create tables."
      );
      console.log("   Run: npm start");
    } else {
      console.log("✅ Found existing tables:");
      tables.rows.forEach((table) => {
        console.log(`   - ${table.table_name} (${table.column_count} columns)`);
      });
      console.log("");
    }

    // Check for sample data
    console.log("3. Checking for sample data...");
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    const recordCount = await pool.query(
      "SELECT COUNT(*) as count FROM health_records"
    );

    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Health Records: ${recordCount.rows[0].count}`);

    // Test a simple dashboard query
    if (userCount.rows[0].count > 0) {
      console.log("\n4. Testing dashboard query...");
      const userQuery = await pool.query("SELECT id FROM users LIMIT 1");
      const userId = userQuery.rows[0].id;

      const totalRecords = await pool.query(
        "SELECT COUNT(*) as count FROM health_records WHERE user_id = $1",
        [userId]
      );
      console.log(
        `✅ Dashboard query test successful - User ${userId} has ${totalRecords.rows[0].count} health records`
      );
    }

    console.log("\n🎉 Database connection test completed successfully!");
    console.log("\nNext steps:");
    console.log('1. Initialize database schema: psql -d medibridge -f database-schema.sql');
    console.log('2. Run "npm start" to start the backend server');
    console.log(
      "3. Test the dashboard API endpoint: GET /api/dashboard/overview"
    );
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    if (
      error.message.includes("relation") &&
      error.message.includes("does not exist")
    ) {
      console.log(
        "\n💡 Tip: Tables don't exist yet. Start the backend server first:"
      );
      console.log("   cd backend && npm start");
    }
  } finally {
    await pool.end();
    console.log("🔒 Database connection closed");
  }
}

// Run the test
testDatabase().catch(console.error);
