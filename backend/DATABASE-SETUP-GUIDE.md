# MediBridge Database Setup Guide

## Running the Schema

Execute this command in your terminal:

```bash
psql -d medibridge -f database-schema.sql
```

## Expected Output

If successful, you should see:

```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMENT
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMENT
CREATE TABLE
CREATE INDEX
CREATE INDEX
COMMENT
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMENT
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMENT
CREATE TABLE
CREATE INDEX
CREATE INDEX
COMMENT
DO
ALTER TABLE
CREATE OR REPLACE FUNCTION
DROP TRIGGER
CREATE TRIGGER
INSERT 0 0
COMMENT
COMMENT
COMMENT
COMMENT
```

This indicates all tables, indexes, triggers, and comments were created successfully.

## Verifying the Database Setup

After running the schema, verify everything was created correctly:

### 1️⃣ List All Tables

```bash
psql -d medibridge -c "\dt"
```

**Expected output:**
```
              List of relations
 Schema |        Name        | Type  | Owner
--------+--------------------+-------+-------
 public | analytics          | table | user
 public | health_records     | table | user
 public | hospital_permissions| table | user
 public | hospitals          | table | user
 public | medical_history    | table | user
 public | medications        | table | user
 public | users              | table | user
 public | verification_logs  | table | user
(8 rows)
```

### 2️⃣ List All Indexes

```bash
psql -d medibridge -c "\di"
```

**Expected output:** Should show 20+ indexes including:
- idx_users_google_id
- idx_users_email
- idx_health_records_user_id
- idx_health_records_icd11
- idx_medications_user_id
- etc.

### 3️⃣ Check Table Structure

```bash
psql -d medibridge -c "\d health_records"
```

**Expected output:**
```
                            Table "public.health_records"
       Column        |            Type             | Collation | Nullable | Default
---------------------+-----------------------------+-----------+----------+---------
 id                  | integer                     |           | not null | nextval('health_records_id_seq'::regclass)
 user_id             | integer                     |           |          |
 record_type         | character varying(100)      |           | not null |
 title               | character varying(255)      |           | not null
 description         | text                        |           |          |
 icd11_code          | character varying(50)       |           |          |
 icd11_title         | character varying(255)      |           |          |
 diagnosis           | text                        |           |          |
 symptoms            | text[]                      |           |          |
 medications         | jsonb                       |           |          |
 test_results        | jsonb                       |           |          |
 attachments         | jsonb                       |           |          |
 doctor_name         | character varying(255)      |           |          |
 hospital_name       | character varying(255)      |           |          |
 hospital_id         | integer                     |           |          |
 visit_date          | date                        |           |          |
 severity            | character varying(50)       |           |          |
 status              | character varying(50)       |           | not null | 'active'::character varying
 verification_status | character varying(50)       |           | not null | 'pending'::character varying
 verification_data   | jsonb                       |           |          |
 created_at          | timestamp without time zone |           |          | CURRENT_TIMESTAMP
 updated_at          | timestamp without time zone |           |          | CURRENT_TIMESTAMP
```

### 4️⃣ Check Functions & Triggers

```bash
psql -d medibridge -c "\df"
```

**Expected output:** Should include:
```
 create_hospital_permissions() | trigger function
```

### 5️⃣ Test Sample Insert

```bash
psql -d medibridge -c "INSERT INTO users (email, name) VALUES ('test@example.com', 'Test User') RETURNING *;"
```

**Expected output:**
```
 id |           email           | name      | google_id | profile_picture | role    | phone | date_of_birth | gender | address | emergency_contact | created_at          | updated_at          | last_login
----+---------------------------+-----------+-----------+-----------------+---------+-------+---------------+--------+---------+-------------------+---------------------+---------------------+------------
  1 | test@example.com          | Test User |           |                 | patient |       |               |        |         |                   | 2026-01-09 12:00:00 | 2026-01-09 12:00:00 |
(1 row)
```

### 6️⃣ Clean Up Test Data (Optional)

```bash
psql -d medibridge -c "DELETE FROM users WHERE email = 'test@example.com';"
```

## Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | User accounts | Google OAuth, roles, profiles |
| **health_records** | Medical records | ICD-11 codes, verification status |
| **medical_history** | Condition history | Diagnosed dates, active status |
| **medications** | Medication tracking | Dosage, frequency, duration |
| **verification_logs** | Audit trail | Verified status, timestamps |
| **analytics** | Dashboard metrics | User metrics, date tracking |
| **hospitals** | Healthcare providers | License, specialties, contact |
| **hospital_permissions** | Access control | Role-based permissions |

## Troubleshooting

### Error: "FATAL: database 'medibridge' does not exist"
```bash
# Create the database first
createdb medibridge
# Then run the schema
psql -d medibridge -f database-schema.sql
```

### Error: "Permission denied"
Make sure your PostgreSQL user has permissions to create tables and indexes.

### Error: "Syntax error"
Check that your database-schema.sql file has proper line endings (use LF, not CRLF on Windows).

## Next Steps

1. ✅ Database schema initialized
2. 🔐 Set up environment variables in `.env`
3. 🚀 Start the backend: `npm start`
4. 📝 Run test suite: `node test-db.js`

