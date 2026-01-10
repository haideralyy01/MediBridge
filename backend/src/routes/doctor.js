import express from "express";
import { db } from "../config/database.js";
import { authenticateToken } from "../auth/auth.js";

const router = express.Router();

// Get doctor profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const query = `
      SELECT d.*, u.name as user_name, u.email 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.user_id = $1
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found"
      });
    }

    const doctor = result.rows[0];
    res.status(200).json({
      success: true,
      profile: {
        id: doctor.id,
        name: doctor.user_name,
        email: doctor.email,
        licenseNumber: doctor.license_number,
        specialties: doctor.specialization ? doctor.specialization.split(',') : [],
        address: doctor.address,
        phone: doctor.phone,
        website: doctor.website,
        description: doctor.description,
        hospital: doctor.hospital,
        yearsOfExperience: doctor.years_of_experience,
        createdAt: doctor.created_at,
        updatedAt: doctor.updated_at
      }
    });
  } catch (error) {
    console.error("❌ Get doctor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor profile"
    });
  }
});

// Create or update doctor profile
router.post("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      licenseNumber,
      specialties,
      address,
      phone,
      website,
      description,
      hospital,
      yearsOfExperience
    } = req.body;

    // Validate required fields
    if (!licenseNumber) {
      return res.status(400).json({
        success: false,
        message: "License number is required"
      });
    }

    // Check if doctor profile already exists
    const existingQuery = "SELECT id FROM doctors WHERE user_id = $1";
    const existingResult = await db.query(existingQuery, [userId]);

    const specialtiesString = Array.isArray(specialties) ? specialties.join(',') : '';

    if (existingResult.rows.length > 0) {
      // Update existing profile
      const updateQuery = `
        UPDATE doctors 
        SET license_number = $1, specialization = $2, address = $3, 
            phone = $4, website = $5, description = $6, hospital = $7,
            years_of_experience = $8, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, [
        licenseNumber, specialtiesString, address, phone, 
        website, description, hospital, yearsOfExperience, userId
      ]);

      // Update user role to doctor
      await db.query("UPDATE users SET role = 'doctor' WHERE id = $1", [userId]);

      res.status(200).json({
        success: true,
        message: "Doctor profile updated successfully",
        profile: result.rows[0]
      });
    } else {
      // Create new profile
      const insertQuery = `
        INSERT INTO doctors (user_id, license_number, specialization, address, 
                           phone, website, description, hospital, years_of_experience)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const result = await db.query(insertQuery, [
        userId, licenseNumber, specialtiesString, address, 
        phone, website, description, hospital, yearsOfExperience
      ]);

      // Update user role to doctor
      await db.query("UPDATE users SET role = 'doctor' WHERE id = $1", [userId]);

      res.status(201).json({
        success: true,
        message: "Doctor profile created successfully",
        profile: result.rows[0]
      });
    }
  } catch (error) {
    console.error("❌ Create/update doctor profile error:", {
      code: error.code,
      message: error.message,
      detail: error.detail,
      where: error.where,
      table: error.table,
      column: error.column,
    });

    // Unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "License number already exists",
        detail: process.env.NODE_ENV === 'development' ? error.detail : undefined,
      });
    }

    // Undefined table
    if (error.code === '42P01') {
      return res.status(500).json({
        success: false,
        message: "Doctors table is missing. Please restart the server to run migrations.",
      });
    }

    // Undefined column
    if (error.code === '42703') {
      return res.status(500).json({
        success: false,
        message: "Column mismatch in doctors table. Please restart to apply column migrations.",
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? `Failed to save doctor profile: ${error.message}` : "Failed to save doctor profile",
    });
  }
});

export default router;