import express from "express";
import { authenticateToken } from "../auth/auth.js";
import { db } from "../config/database.js";
import {
  requirePermission,
  requireResourceAccess,
  getHealthRecordOwnerId,
  filterDataByRole,
  auditLog,
  PERMISSIONS,
  ROLES,
} from "../middleware/rbac.js";

const router = express.Router();

// Get all health records for authenticated user
router.get(
  "/",
  authenticateToken,
  requirePermission(PERMISSIONS.READ_OWN_RECORDS),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, type, status } = req.query;
      const offset = (page - 1) * limit;

      // Support filtering by patientId if provided in query
      let records;
      if (req.query.patientId) {
        records = await db.getHealthRecordsByPatientId(req.query.patientId, limit, offset);
      } else {
        let query = `
        SELECT hr.*, u.name as user_name 
        FROM health_records hr 
        JOIN users u ON hr.user_id = u.id 
        WHERE hr.user_id = $1
      `;
        const params = [req.user.id];
        let paramCount = 2;

        // Add filters
        if (type) {
          query += ` AND hr.record_type = $${paramCount}`;
          params.push(type);
          paramCount++;
        }

        if (status) {
          query += ` AND hr.status = $${paramCount}`;
          params.push(status);
          paramCount++;
        }

        query += ` ORDER BY hr.created_at DESC LIMIT $${paramCount} OFFSET $${
          paramCount + 1
        }`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Filter data based on user role
        records = filterDataByRole(
          result.rows,
          req.user.role,
          req.user.id
        );
      }

      // Get total count for pagination
      let totalRecords = records.length;
      // If not using patientId, get actual count from DB for pagination
      if (!req.query.patientId) {
        let countQuery = "SELECT COUNT(*) FROM health_records WHERE user_id = $1";
        const countParams = [req.user.id];
        if (type) {
          countQuery += " AND record_type = $2";
          countParams.push(type);
        }
        const countResult = await db.query(countQuery, countParams);
        totalRecords = parseInt(countResult.rows[0].count);
      }
      res.json({
        success: true,
        data: records,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords,
          hasNextPage: page * limit < totalRecords,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error("❌ Get Health Records Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch health records",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Get specific health record by ID
// Get specific health record by ID (by user or patientId)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    let record;
    if (req.query.patientId) {
      record = await db.getHealthRecordByPatientId(recordId, req.query.patientId);
    } else {
      record = await db.getHealthRecordById(recordId, req.user.id);
    }
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found",
      });
    }
    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("❌ Get Health Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch health record",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Create new health record
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
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
      patientId,
    } = req.body;

    // Validation
    if (!recordType || !title) {
      return res.status(400).json({
        success: false,
        message: "Record type and title are required",
      });
    }

    const recordData = {
      userId: req.user.id,
      patientId,
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
      severity: severity || "mild",
    };

    const newRecord = await db.createHealthRecord(recordData);

    // Create analytics entry
    await db.createAnalyticsEntry({
      userId: req.user.id,
      metricType: "record_created",
      metricValue: { recordType, severity },
      dateRecorded: new Date().toISOString().split("T")[0],
    });

    // Audit log
    await auditLog(
      "CREATE_HEALTH_RECORD",
      req.user.id,
      "health_record",
      newRecord.id,
      {
        recordType,
        title,
        severity,
      }
    );

    res.status(201).json({
      success: true,
      message: "Health record created successfully",
      data: newRecord,
    });
  } catch (error) {
    console.error("❌ Create Health Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create health record",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update health record
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.userId;
    delete updateData.verification_status;
    delete updateData.created_at;

    const updatedRecord = await db.updateHealthRecord(
      recordId,
      req.user.id,
      updateData
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Health record not found or no changes made",
      });
    }

    res.json({
      success: true,
      message: "Health record updated successfully",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("❌ Update Health Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update health record",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Delete health record
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const recordId = req.params.id;
    const deletedRecord = await db.deleteHealthRecord(recordId, req.user.id);

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Health record not found",
      });
    }

    res.json({
      success: true,
      message: "Health record deleted successfully",
      data: deletedRecord,
    });
  } catch (error) {
    console.error("❌ Delete Health Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete health record",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get health records statistics
router.get("/stats/overview", authenticateToken, async (req, res) => {
  try {
    const stats = await db.getDashboardStats(req.user.id);

    // Get recent activity
    const recentRecords = await db.getHealthRecordsByUserId(req.user.id, 5, 0);

    // Get records by type
    const typeStatsQuery = `
      SELECT record_type, COUNT(*) as count 
      FROM health_records 
      WHERE user_id = $1 
      GROUP BY record_type
    `;
    const typeStats = await db.query(typeStatsQuery, [req.user.id]);

    res.json({
      success: true,
      data: {
        overview: stats,
        recentRecords,
        recordsByType: typeStats.rows,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Get Health Records Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
