# 🏥 MediBridge Backend API

> **Secure, scalable healthcare management system bridging traditional Indian medicine with modern standards**

A robust Node.js backend API for the MediBridge platform that provides comprehensive health record management, ICD-11 integration, and hospital authentication systems.

## 🌟 Overview

MediBridge Backend is a RESTful API server built with Express.js that powers the MediBridge healthcare platform. It integrates traditional Indian medicine (Ayush) with modern medical standards, providing secure patient record management with hospital-verified authentication.

### 🎯 Key Capabilities

- **🔐 Multi-tier Authentication** - Google OAuth, JWT tokens, and hospital verification
- **🏥 Comprehensive Health Records** - Complete CRUD operations with ICD-11 integration
- **🌐 Bilingual Support** - English and Namaste (traditional Indian) medical terminology
- **📊 Advanced Analytics** - Health trends, statistics, and dashboard data
- **🛡️ Enterprise Security** - Role-based access, rate limiting, and audit logging
- **⚡ High Performance** - Optimized database queries and caching strategies

## ✨ Features

### 🔐 Authentication & Security

- **Google OAuth 2.0** - Secure social authentication
- **JWT Tokens** - Stateless authentication with configurable expiration
- **Hospital Authentication** - Special verification for healthcare providers
- **Role-Based Access Control (RBAC)** - Granular permissions system
- **Rate Limiting** - Protection against API abuse and DDoS
- **Security Headers** - Comprehensive security with Helmet.js
- **Session Management** - Secure session handling with cookies
- **Audit Logging** - Complete trail of all sensitive operations

### 🏥 Health Records Management

- **Complete CRUD Operations** - Create, read, update, delete health records
- **Multi-type Records** - Support for consultations, lab results, prescriptions, imaging
- **ICD-11 Integration** - World Health Organization standard medical codes
- **Namaste Names** - Traditional Indian medicine terminology support
- **Patient-Centric Design** - Records organized by patient with privacy controls
- **Document Verification** - Hospital-verified authentic medical documents
- **Search & Filtering** - Advanced search capabilities with multiple criteria
- **Batch Operations** - Efficient handling of multiple records

### 📊 Dashboard & Analytics

- **Real-time Metrics** - Live health statistics and KPIs
- **Trend Analysis** - Historical health data visualization
- **Export Capabilities** - Data export in JSON and CSV formats
- **Custom Reports** - Flexible reporting system for healthcare insights
- **Reminder System** - Medication and appointment reminders
- **Population Health** - Anonymized aggregate health data

### 🔍 Verification System

- **Document Verification** - Integrated verification workflows
- **Confidence Scoring** - AI-powered verification confidence levels
- **Batch Verification** - Process multiple documents simultaneously
- **Verification History** - Complete audit trail of verification activities
- **Hospital Integration** - Direct integration with hospital systems

## 🛠️ Technology Stack

### Core Technologies

```
🟢 Node.js 18+           - JavaScript runtime environment
🚀 Express.js 4.18.2     - Web application framework
🐘 PostgreSQL 12+        - Primary database system
🔐 JWT 9.0.2             - JSON Web Token authentication
```

### Security & Middleware

```
🛡️ Helmet.js 7.1.0       - Security headers
⏱️ Rate Limiting 7.1.5    - API abuse protection
🍪 Cookie Parser 1.4.7    - Cookie handling
🔒 bcryptjs 2.4.3        - Password hashing
🌐 CORS 2.8.5            - Cross-origin resource sharing
```

### Authentication & Integration

```
🔍 Google Auth 9.2.0     - OAuth 2.0 integration
🏥 Hospital Auth         - Custom healthcare provider auth
📊 Analytics Engine      - Custom health analytics
🔄 Database Pool         - Connection pooling for performance
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication logic
│   │   ├── auth.js          # Auth utilities and middleware
│   │   └── routes.js        # Auth endpoints
│   ├── config/              # Configuration files
│   │   └── database.js      # Database connection setup
│   ├── middleware/          # Custom middleware
│   │   ├── hospitalAuth.js  # Hospital authentication
│   │   └── rbac.js         # Role-based access control
│   ├── routes/              # API route handlers
│   │   ├── dashboard.js     # Dashboard endpoints
│   │   ├── healthRecords.js # Health records CRUD
│   │   ├── hospital.js      # Hospital management
│   │   └── verification.js  # Document verification
│   └── index.js             # Main application entry point
├── database-*.sql           # Database schema and setup
├── test-*.js               # Testing utilities
├── package.json            # Dependencies and scripts
└── README.md               # This documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - Latest LTS version recommended
- **PostgreSQL 12+** - Database server
- **npm/yarn** - Package manager
- **Google Cloud Account** - For OAuth configuration

### 1️⃣ Installation

```bash
# Clone the repository
git clone <repository-url>
cd medibridge/backend

# Install dependencies
npm install

# Verify installation
npm ls --depth=0
```

### 2️⃣ Database Setup

```bash
# Create PostgreSQL database
createdb medibridge

# Run database schema
psql -d medibridge -f database-schema.sql

# Test database connection
node test-database.js
```

### 3️⃣ Environment Configuration

Create a `.env` file in the backend root directory:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URL=postgresql://username:password@localhost:5432/medibridge
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medibridge
DB_USER=your_username
DB_PASSWORD=your_password

# ===========================================
# AUTHENTICATION SECRETS
# ===========================================
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret-key

# ===========================================
# GOOGLE OAUTH CONFIGURATION
# ===========================================
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
API_VERSION=v1

# ===========================================
# SECURITY SETTINGS
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12

# ===========================================
# CORS SETTINGS
# ===========================================
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true
```

### 4️⃣ Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Test the server
curl http://localhost:3000/api/health
```

### 5️⃣ Verify Installation

```bash
# Test database connection
node test-database.js

# Test environment variables
node test-env.js

# Check API endpoints
curl http://localhost:3000/api/dashboard/overview
```

## 📚 API Documentation

### 🔗 Base URL

```
Development: http://localhost:3000/api
Production:  https://api.medibridge.com/api
```

### 🔑 Authentication Endpoints

#### `POST /api/auth/google`

Authenticate user with Google OAuth token

**Request:**

```json
{
  "token": "google-oauth-id-token",
  "userType": "patient" // or "hospital"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "patient"
    },
    "token": "jwt-token-here",
    "expiresIn": "7d"
  }
}
```

#### `GET /api/auth/profile`

Get current authenticated user profile

**Headers:** `Authorization: Bearer <jwt-token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "patient",
    "verified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### `POST /api/auth/logout`

Logout user and invalidate session

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 🏥 Health Records Endpoints

#### `GET /api/health-records`

Retrieve user's health records with pagination and filtering

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Records per page (default: 10, max: 100)
- `type` (string): Record type filter
- `status` (string): Verification status filter
- `search` (string): Search term for title/description
- `startDate` (date): Filter records from date
- `endDate` (date): Filter records to date

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "John Doe",
      "recordType": "consultation",
      "description": "Annual health checkup",
      "icd11Code": "QA02",
      "icd11Title": "General medical examination",
      "diagnosis": "Healthy individual",
      "symptoms": ["routine checkup"],
      "namasteName": "वार्षिक स्वास्थ्य जांच",
      "doctorName": "Dr. Smith",
      "hospitalName": "City Hospital",
      "visitDate": "2024-01-15",
      "severity": "mild",
      "verificationStatus": "verified",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 47,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### `POST /api/health-records`

Create a new health record

**Request:**

```json
{
  "recordType": "consultation",
  "title": "John Doe",
  "description": "Annual physical examination",
  "icd11Code": "QA02",
  "icd11Title": "General medical examination",
  "diagnosis": "Patient is in good health",
  "symptoms": ["routine checkup", "no complaints"],
  "namasteName": "वार्षिक स्वास्थ्य जांच",
  "doctorName": "Dr. Sarah Johnson",
  "hospitalName": "MediBridge General Hospital",
  "visitDate": "2024-01-15",
  "severity": "mild"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "John Doe",
    "recordType": "consultation",
    // ... full record data
    "verificationStatus": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Health record created successfully"
}
```

#### `GET /api/health-records/:id`

Get specific health record by ID

#### `PUT /api/health-records/:id`

Update existing health record

#### `DELETE /api/health-records/:id`

Delete health record (soft delete with audit trail)

#### `GET /api/health-records/stats/overview`

Get health records statistics and overview

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRecords": 47,
    "recordsByType": {
      "consultation": 15,
      "labResult": 12,
      "prescription": 10,
      "imaging": 8,
      "vaccination": 2
    },
    "verificationStatus": {
      "verified": 35,
      "pending": 10,
      "rejected": 2
    },
    "recentRecords": 5,
    "healthScore": 85.5
  }
}
```

### 📊 Dashboard Endpoints

#### `GET /api/dashboard/overview`

Comprehensive dashboard data for authenticated user

**Response:**

```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalRecords": 47,
      "verifiedRecords": 35,
      "pendingVerification": 10,
      "healthScore": 85.5
    },
    "recentRecords": [...],
    "medicalHistory": [...],
    "upcomingReminders": [...],
    "chartData": {
      "healthTrends": [...],
      "recordsOverTime": [...]
    }
  }
}
```

#### `GET /api/dashboard/analytics`

Advanced analytics with time-series data

**Query Parameters:**

- `period` (string): 7d, 30d, 90d, 1y
- `metric` (string): health_score, record_count, verification_rate

#### `GET /api/dashboard/export`

Export user's health data

**Query Parameters:**

- `format` (string): json, csv
- `includeAttachments` (boolean): Include file attachments

### 🔍 Verification Endpoints

#### `POST /api/verification/verify/:recordId`

Verify a specific health record

**Request:**

```json
{
  "verificationType": "full",
  "verifierNotes": "Document verified against hospital records"
}
```

#### `POST /api/verification/verify-batch`

Batch verify multiple health records

**Request:**

```json
{
  "recordIds": [1, 2, 3, 4, 5],
  "verificationType": "full"
}
```

#### `GET /api/verification/history/:recordId`

Get verification history for a specific record

#### `GET /api/verification/stats`

Get verification system statistics

### 🏥 Hospital Endpoints

#### `GET /api/hospital/dashboard`

Hospital-specific dashboard (requires hospital role)

#### `POST /api/hospital/verify-record`

Hospital verification of patient records

## 🔐 Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "patient",
  "hospitalId": null,
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Role-Based Permissions

| Role         | Permissions                                |
| ------------ | ------------------------------------------ |
| **Patient**  | Read/write own records, view own dashboard |
| **Doctor**   | Read/write all records, access analytics   |
| **Hospital** | Verify records, manage hospital patients   |
| **Admin**    | Full system access, user management        |

### Security Middleware Chain

1. **Helmet.js** - Security headers
2. **CORS** - Cross-origin request validation
3. **Rate Limiting** - Request throttling
4. **JWT Validation** - Token verification
5. **Role Authorization** - Permission checking
6. **Input Validation** - Request sanitization

## 🗄️ Database Schema

### Core Tables

#### `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'patient',
  hospital_id INTEGER REFERENCES hospitals(id),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `health_records`

```sql
CREATE TABLE health_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  record_type VARCHAR(100) NOT NULL,
  description TEXT,
  icd11_code VARCHAR(20),
  icd11_title VARCHAR(255),
  diagnosis TEXT,
  symptoms JSONB,
  namaste_name VARCHAR(255),
  doctor_name VARCHAR(255),
  hospital_name VARCHAR(255),
  visit_date DATE,
  severity VARCHAR(50),
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `hospitals`

```sql
CREATE TABLE hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_type ON health_records(record_type);
CREATE INDEX idx_health_records_date ON health_records(visit_date);
CREATE INDEX idx_health_records_verification ON health_records(verification_status);

-- Search indexes
CREATE INDEX idx_health_records_search ON health_records USING gin(to_tsvector('english', title || ' ' || description));
```

## 🔒 Security Features

### Input Validation & Sanitization

```javascript
// Example validation middleware
const validateHealthRecord = [
  body("title").trim().isLength({ min: 1, max: 255 }),
  body("recordType").isIn([
    "consultation",
    "lab_result",
    "prescription",
    "imaging",
  ]),
  body("icd11Code")
    .optional()
    .matches(/^[A-Z0-9.]+$/),
  body("severity").isIn(["mild", "moderate", "severe"]),
  // ... additional validations
];
```

### Rate Limiting Configuration

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Security Headers

```javascript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

## ⚡ Performance Optimization

### Database Connection Pooling

```javascript
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of clients
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds
});
```

### Caching Strategy

- **In-Memory Caching** for frequently accessed data
- **Redis Integration** ready for session storage
- **Database Query Caching** for static reference data
- **API Response Caching** for dashboard analytics

### Pagination & Filtering

```javascript
// Efficient pagination with limit/offset
const getHealthRecords = async (userId, page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT * FROM health_records 
    WHERE user_id = $1 
    ${filters.type ? "AND record_type = $2" : ""}
    ORDER BY created_at DESC 
    LIMIT $${filters.type ? 3 : 2} OFFSET $${filters.type ? 4 : 3}
  `;

  // ... query execution
};
```

## 🧪 Testing

### Test Environment Setup

```bash
# Create test database
createdb medibridge_test

# Set test environment
export NODE_ENV=test
export DATABASE_URL=postgresql://user:pass@localhost:5432/medibridge_test

# Run tests (when implemented)
npm test
```

### Test Files

- `test-database.js` - Database connection testing
- `test-env.js` - Environment variables validation
- `test-neon.js` - Cloud database testing

### Testing Strategy

- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Security Tests** - Authentication and authorization
- **Performance Tests** - Load testing for scalability

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-host:5432/medibridge
JWT_SECRET=production-super-secure-secret
FRONTEND_URL=https://medibridge.com
CORS_ORIGIN=https://medibridge.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
EXPOSE 3000

CMD ["npm", "start"]
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure database connection with SSL
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting for production load
- [ ] Set up monitoring and logging (Winston, Morgan)
- [ ] Configure backup strategies
- [ ] Set up health check endpoints
- [ ] Configure proper CORS origins
- [ ] Set secure JWT secrets (min 32 characters)
- [ ] Enable database connection pooling
- [ ] Set up error tracking (Sentry)

### Health Check Endpoint

```javascript
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});
```

## 📊 Monitoring & Logging

### Request Logging

```javascript
import morgan from "morgan";

// Custom logging format
morgan.token("user", (req) => req.user?.id || "anonymous");

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :user")
);
```

### Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (process.env.NODE_ENV === "production") {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } else {
    res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
});
```

### Audit Logging

```javascript
const logAuditEvent = async (
  userId,
  action,
  resourceType,
  resourceId,
  details
) => {
  await pool.query(
    `
    INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
  `,
    [userId, action, resourceType, resourceId, JSON.stringify(details)]
  );
};
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create feature branch: `git checkout -b feature/amazing-feature`
5. Set up development database and environment variables
6. Make your changes and test thoroughly
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Coding Standards

- **ES6+ JavaScript** with ES modules
- **Express.js** best practices
- **Async/await** for asynchronous operations
- **Error handling** with try-catch blocks
- **Input validation** for all endpoints
- **Security first** approach
- **Performance optimization** considerations

### Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: auth, records, dashboard, db, security

Examples:
feat(auth): add hospital authentication system
fix(records): resolve pagination issue in health records
docs(api): update authentication endpoint documentation
```

## 📝 API Response Standards

### Success Response Format

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Pagination Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalRecords": 95,
    "recordsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 📚 Additional Resources

### Documentation Links

- **API Postman Collection** - [Import Link]
- **Database Schema** - [ERD Diagram]
- **Security Guidelines** - [Security Doc]
- **Deployment Guide** - [Deploy Doc]

### External Dependencies Documentation

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Documentation](https://jwt.io/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **📧 Email Support** - backend-support@medibridge.com
- **💬 GitHub Issues** - For bugs and feature requests
- **📖 Documentation** - Check this README and inline code comments
- **🎥 Video Tutorials** - [YouTube Channel]

### Reporting Issues

When reporting issues, please include:

- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Error logs and stack traces
- Environment details (development/production)

---

<div align="center">

**🏥 Built with ❤️ for Digital India Healthcare Initiative 🇮🇳**

_Secure • Scalable • Standards-Compliant_

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

</div>

1. **Clone and install dependencies:**

```bash
cd backend
npm install
```

2. **Environment Configuration:**
   Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. **Start the server:**

```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

### 🔑 Authentication Endpoints

#### POST `/api/auth/google`

Google OAuth authentication

```json
{
  "token": "google-id-token"
}
```

#### GET `/api/auth/profile`

Get current user profile (requires authentication)

#### GET `/api/auth/verify`

Verify JWT token validity

#### POST `/api/auth/logout`

Logout and clear session

### 🏥 Health Records Endpoints

#### GET `/api/health-records`

Get user's health records with pagination and filtering

- Query params: `page`, `limit`, `type`, `status`

#### POST `/api/health-records`

Create new health record

```json
{
  "recordType": "consultation",
  "title": "Annual Checkup",
  "description": "Routine annual physical examination",
  "icd11Code": "QA02",
  "diagnosis": "Normal examination findings",
  "doctorName": "Dr. Smith",
  "hospitalName": "City Hospital",
  "visitDate": "2024-01-15",
  "severity": "mild"
}
```

#### GET `/api/health-records/:id`

Get specific health record

#### PUT `/api/health-records/:id`

Update health record

#### DELETE `/api/health-records/:id`

Delete health record

#### GET `/api/health-records/stats/overview`

Get health records statistics

### 📊 Dashboard Endpoints

#### GET `/api/dashboard/overview`

Comprehensive dashboard data including:

- Statistics overview
- Recent records
- Medical history summary
- Verification status
- Charts data

#### GET `/api/dashboard/analytics`

Advanced analytics with time-series data

- Query params: `period` (7d, 30d, 90d, 1y), `metric`

#### GET `/api/dashboard/trends`

Health trends and scoring

#### GET `/api/dashboard/reminders`

Upcoming medication and follow-up reminders

#### GET `/api/dashboard/export`

Export health data

- Query params: `format` (json, csv), `includeAttachments` (true, false)

### 🔍 Verification Endpoints

#### GET `/api/verification/icd11/search`

Search ICD-11 codes

- Query params: `query`, `limit`

#### GET `/api/verification/icd11/:code`

Get specific ICD-11 code details

#### POST `/api/verification/verify/:recordId`

Verify single health record with Namaste TM2

```json
{
  "verificationType": "full"
}
```

#### POST `/api/verification/verify-batch`

Batch verify multiple records

```json
{
  "recordIds": [1, 2, 3],
  "verificationType": "full"
}
```

#### GET `/api/verification/history/:recordId`

Get verification history for a record

#### GET `/api/verification/stats`

Get verification statistics

## 🔐 Role-Based Access Control

### Roles

- **Patient**: Can manage own records
- **Doctor**: Can view/edit all records
- **Verifier**: Can verify records and view analytics
- **Admin**: Full system access

### Permissions

- `read_own_records`: Read user's own records
- `write_own_records`: Create/edit user's own records
- `read_all_records`: Read all records in system
- `write_all_records`: Create/edit any records
- `verify_records`: Perform record verification
- `manage_users`: User management operations
- `view_analytics`: Access analytics dashboards
- `export_data`: Export user data

## 🗄️ Database Schema

### Core Tables

- **users**: User profiles and authentication
- **health_records**: Main health record storage
- **medical_history**: Chronic conditions and history
- **medications**: Current and past medications
- **verification_logs**: Verification audit trail
- **analytics**: Metrics and dashboard data
- **audit_logs**: System audit trail

### Key Features

- **Automated indexing** for performance
- **JSON fields** for flexible data storage
- **Audit trails** for compliance
- **Referential integrity** with foreign keys

## 🔒 Security Features

### Authentication Security

- **JWT tokens** with configurable expiration
- **HTTP-only cookies** option
- **Session management** with secure settings
- **CORS protection** with whitelist

### API Security

- **Rate limiting** (100 requests/15min, 5 auth/15min)
- **Helmet.js** security headers
- **Input validation** and sanitization
- **Role-based authorization** on all endpoints

### Data Security

- **Encrypted sensitive fields**
- **Audit logging** for all operations
- **Data anonymization** options
- **GDPR compliance** ready

## 📈 Performance & Monitoring

### Database Optimization

- **Connection pooling** with configurable limits
- **Query optimization** with indexes
- **Pagination** for large datasets
- **Caching strategies** ready

### Monitoring

- **Request logging** with timing
- **Error tracking** and reporting
- **Health check** endpoints
- **Audit trail** for compliance

## 🧪 Testing & Development

### Development Scripts

```bash
npm run dev      # Start development server
npm run start    # Start production server
npm run test     # Run test suite (to be implemented)
```

### Development Features

- **Hot reload** with nodemon
- **Environment-based** configuration
- **Detailed error** messages in development
- **SQL query logging** for debugging

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure database connection
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Environment Variables

Ensure all required environment variables are set:

- Database connection string
- JWT secrets
- Google OAuth credentials
- CORS origins
- Rate limiting settings

## 🔧 Integration Points

### ICD-11 Integration

The system is designed to integrate with the official ICD-11 API:

- Search functionality for medical codes
- Code validation and details
- Hierarchical navigation
- Multi-language support ready

### Namaste TM2 Integration

Verification system integration points:

- Document verification API
- Confidence scoring
- Batch processing
- Result tracking

## 📝 API Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation completed successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

**Paginated Response:**

```json
{
  "success": true,
  "data": [
    /* array of items */
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 100,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@medibridge.com or create an issue in the repository.

---

**MediBridge Backend** - Revolutionizing health record management with cutting-edge technology and security. 🏥✨
