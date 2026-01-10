import express from "express";
import { authenticateToken } from "../auth/auth.js";
import { db } from "../config/database.js";

const router = express.Router();

// List medications for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const meds = await db.getMedicationsByUserId(req.user.id);
    res.json({ success: true, data: meds });
  } catch (error) {
    console.error("❌ Get Medications Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch medications" });
  }
});

// Create medication
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      medicationName,
      dosage,
      frequency,
      prescribedBy,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (!medicationName) {
      return res.status(400).json({ success: false, message: "Medication name is required" });
    }

    const med = await db.createMedication({
      userId: req.user.id,
      medicationName,
      dosage,
      frequency,
      prescribedBy,
      startDate,
      endDate,
      notes,
    });

    res.status(201).json({ success: true, message: "Medication created", data: med });
  } catch (error) {
    console.error("❌ Create Medication Error:", error);
    res.status(500).json({ success: false, message: "Failed to create medication", error: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined });
  }
});

// Update medication
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const medId = req.params.id;
    const updateData = { ...req.body };
    delete updateData.userId;

    const updated = await db.updateMedication(medId, req.user.id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Medication not found or no changes" });
    }
    res.json({ success: true, message: "Medication updated", data: updated });
  } catch (error) {
    console.error("❌ Update Medication Error:", error);
    res.status(500).json({ success: false, message: "Failed to update medication" });
  }
});

// Delete medication
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const medId = req.params.id;
    const deleted = await db.deleteMedication(medId, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Medication not found" });
    }
    res.json({ success: true, message: "Medication deleted", data: deleted });
  } catch (error) {
    console.error("❌ Delete Medication Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete medication" });
  }
});

export default router;