import express from "express";
import { authenticateToken } from "../auth/auth.js";
import { db } from "../config/database.js";

const router = express.Router();

// ICD-11 API integration helper
const searchICD11 = async (searchTerm) => {
  try {
    // This would integrate with actual ICD-11 API
    // For now, return mock data structure
    const mockResults = [
      {
        code: "KB2Y",
        title: "Other specified diseases of the respiratory system",
        definition: "Respiratory system diseases not elsewhere classified",
        parent: "KB2",
      },
      {
        code: "KB23",
        title: "Allergic rhinitis",
        definition: "Inflammation of nasal mucosa due to allergens",
        parent: "KB2",
      },
    ];

    return mockResults.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("ICD-11 Search Error:", error);
    return [];
  }
};


// Search ICD-11 codes
router.get("/icd11/search", authenticateToken, async (req, res) => {
  try {
    const { query: searchQuery, limit = 10 } = req.query;

    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const results = await searchICD11(searchQuery);

    res.json({
      success: true,
      data: results.slice(0, limit),
      query: searchQuery,
      count: results.length,
    });
  } catch (error) {
    console.error("❌ ICD-11 Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search ICD-11 codes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get ICD-11 code details
router.get("/icd11/:code", authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;

    // Mock ICD-11 code details
    const mockCodeDetail = {
      code: code,
      title: "Sample Condition",
      definition: "Detailed definition of the medical condition",
      synonyms: ["Alternative name 1", "Alternative name 2"],
      parent: "Parent Category",
      children: ["Child condition 1", "Child condition 2"],
      relatedCodes: ["Related1", "Related2"],
      lastUpdated: "2024-01-15",
    };

    res.json({
      success: true,
      data: mockCodeDetail,
    });
  } catch (error) {
    console.error("❌ ICD-11 Code Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ICD-11 code details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Remove Namaste TM2 verification logic. Verification endpoint is now disabled or should be replaced with your own logic.
router.post("/verify/:recordId", authenticateToken, async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Verification logic removed. Implement your own verification here.",
  });
});

// Get verification history for a record
router.get("/history/:recordId", authenticateToken, async (req, res) => {
  try {
    const { recordId } = req.params;

    // Verify user owns the record
    const record = await db.getHealthRecordById(recordId, req.user.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Health record not found",
      });
    }

    // Get verification history
    const historyQuery = `
      SELECT * FROM verification_logs 
      WHERE record_id = $1 
      ORDER BY verified_at DESC
    `;
    const history = await db.query(historyQuery, [recordId]);

    res.json({
      success: true,
      data: {
        recordId: record.id,
        recordTitle: record.title,
        currentStatus: record.verification_status,
        verificationHistory: history.rows,
      },
    });
  } catch (error) {
    console.error("❌ Verification History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification history",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Bulk verify multiple records
router.post("/verify-batch", authenticateToken, async (req, res) => {
  try {
    const { recordIds, verificationType = "full" } = req.body;

    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Record IDs array is required",
      });
    }

    if (recordIds.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot verify more than 10 records at once",
      });
    }

    const results = [];

    for (const recordId of recordIds) {
      try {
        const record = await db.getHealthRecordById(recordId, req.user.id);

        if (!record) {
          results.push({
            recordId,
            success: false,
            message: "Record not found",
          });
          continue;
        }

        if (record.verification_status === "verified") {
          results.push({
            recordId,
            success: true,
            message: "Already verified",
            status: "verified",
          });
          continue;
        }

        // Namaste TM2 logic removed from batch verification. Implement your own logic here if needed.
        results.push({
          recordId,
          success: false,
          message: "Verification logic removed. Implement your own verification here.",
        });
      } catch (error) {
        results.push({
          recordId,
          success: false,
          message: "Verification failed",
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success && r.verified).length;

    res.json({
      success: true,
      message: `Batch verification completed. ${successCount}/${recordIds.length} records verified successfully.`,
      data: {
        results,
        summary: {
          total: recordIds.length,
          successful: successCount,
          failed: recordIds.length - successCount,
        },
      },
    });
  } catch (error) {
    console.error("❌ Batch Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform batch verification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get verification statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall verification stats
    const overallStatsQuery = `
      SELECT 
        verification_status,
        COUNT(*) as count
      FROM health_records 
      WHERE user_id = $1
      GROUP BY verification_status
    `;
    const overallStats = await db.query(overallStatsQuery, [userId]);

    // Recent verification activity
    const recentActivityQuery = `
      SELECT 
        vl.*,
        hr.title as record_title
      FROM verification_logs vl
      JOIN health_records hr ON vl.record_id = hr.id
      WHERE hr.user_id = $1
      ORDER BY vl.verified_at DESC
      LIMIT 10
    `;
    const recentActivity = await db.query(recentActivityQuery, [userId]);

    // Verification success rate by type
    const successRateQuery = `
      SELECT 
        verification_type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as successful
      FROM verification_logs vl
      JOIN health_records hr ON vl.record_id = hr.id
      WHERE hr.user_id = $1
      GROUP BY verification_type
    `;
    const successRates = await db.query(successRateQuery, [userId]);

    res.json({
      success: true,
      data: {
        overallStats: overallStats.rows,
        recentActivity: recentActivity.rows,
        successRates: successRates.rows.map((row) => ({
          type: row.verification_type,
          total: parseInt(row.total),
          successful: parseInt(row.successful),
          successRate: (
            (parseInt(row.successful) / parseInt(row.total)) *
            100
          ).toFixed(2),
        })),
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Verification Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
