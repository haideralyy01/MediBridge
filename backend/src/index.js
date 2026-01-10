import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./auth/routes.js";
import healthRecordsRoutes from "./routes/healthRecords.js";
import dashboardRoutes from "./routes/dashboard.js";
import verificationRoutes from "./routes/verification.js";
import doctorRoutes from "./routes/doctor.js";
import medicationsRoutes from "./routes/medications.js";
import testsRoutes from "./routes/tests.js";
import "./config/database.js"; // Initialize database connection

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware (keep simple to avoid startup issues in dev)
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit auth attempts
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
});

app.use("/api/auth", authLimiter);
app.use(limiter);

// Middleware
// CORS: allow frontend dev origins
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8080",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin (mobile apps, curl) and allowed dev origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Authentication routes
app.use("/api/auth", authRoutes);

// Health Records routes
app.use("/api/health-records", healthRecordsRoutes);

// Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Verification routes
app.use("/api/verification", verificationRoutes);

// Doctor routes
app.use("/api/doctor", doctorRoutes);

// Medications routes
app.use("/api/medications", medicationsRoutes);

// Tests routes
app.use("/api/tests", testsRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to MediBridge Backend API",
    version: "1.0.0",
    status: "Server is running successfully",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: "/api/auth",
      healthRecords: "/api/health-records",
      dashboard: "/api/dashboard",
      verification: "/api/verification",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes placeholder
app.get("/api", (req, res) => {
  res.json({
    message: "API endpoints will be available here",
    endpoints: {
      health: "/health",
      api: "/api",
      auth: {
        login: "POST /api/auth/google",
        profile: "GET /api/auth/profile",
        logout: "POST /api/auth/logout",
        verify: "GET /api/auth/verify",
        protected: "GET /api/auth/protected",
      },
      healthRecords: {
        list: "GET /api/health-records",
        create: "POST /api/health-records",
        get: "GET /api/health-records/:id",
        update: "PUT /api/health-records/:id",
        delete: "DELETE /api/health-records/:id",
        stats: "GET /api/health-records/stats/overview",
      },
      dashboard: {
        overview: "GET /api/dashboard/overview",
        analytics: "GET /api/dashboard/analytics",
        trends: "GET /api/dashboard/trends",
        reminders: "GET /api/dashboard/reminders",
        export: "GET /api/dashboard/export",
      },
      verification: {
        icd11Search: "GET /api/verification/icd11/search",
        verify: "POST /api/verification/verify/:recordId",
        batchVerify: "POST /api/verification/verify-batch",
        history: "GET /api/verification/history/:recordId",
        stats: "GET /api/verification/stats",
      },
      medications: {
        list: "GET /api/medications",
        create: "POST /api/medications",
        update: "PUT /api/medications/:id",
        delete: "DELETE /api/medications/:id",
      },
      tests: {
        list: "GET /api/tests",
        create: "POST /api/tests",
        update: "PUT /api/tests/:id",
        delete: "DELETE /api/tests/:id",
      },
      doctor: {
        profile: "GET /api/doctor/profile",
        createProfile: "POST /api/doctor/profile",
      },
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Global error handlers for better diagnostics
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// Start server
try {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🏥 MediBridge Backend API started successfully`);
  });
} catch (err) {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
}

export default app;
