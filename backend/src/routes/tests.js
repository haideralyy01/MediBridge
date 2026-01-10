import express from "express";
import { authenticateToken } from "../auth/auth.js";
import { db } from "../config/database.js";

const router = express.Router();

// List tests for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tests = await db.getTestRecordsByUserId(req.user.id);
    res.json({ success: true, data: tests });
  } catch (error) {
    console.error("❌ Get Tests Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tests" });
  }
});

// Create test record
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { testName, testType, frequency, reason, instructions, status } = req.body;

    if (!testName || !testType) {
      return res.status(400).json({ success: false, message: "Test name and type are required" });
    }

    const test = await db.createTestRecord({
      userId: req.user.id,
      testName,
      testType,
      frequency,
      reason,
      instructions,
      status,
    });

    res.status(201).json({ success: true, message: "Test record created", data: test });
  } catch (error) {
    console.error("❌ Create Test Error:", error);
    res.status(500).json({ success: false, message: "Failed to create test record" });
  }
});

// Update test record
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const testId = req.params.id;
    const updateData = { ...req.body };
    delete updateData.userId;

    const updated = await db.updateTestRecord(testId, req.user.id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Test record not found or no changes" });
    }
    res.json({ success: true, message: "Test record updated", data: updated });
  } catch (error) {
    console.error("❌ Update Test Error:", error);
    res.status(500).json({ success: false, message: "Failed to update test record" });
  }
});

// Delete test record
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const testId = req.params.id;
    const deleted = await db.deleteTestRecord(testId, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Test record not found" });
    }
    res.json({ success: true, message: "Test record deleted", data: deleted });
  } catch (error) {
    console.error("❌ Delete Test Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete test record" });
  }
});

export default router;