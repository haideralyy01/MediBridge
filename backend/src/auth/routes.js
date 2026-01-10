import express from "express";
import {
  googleAuthMiddleware,
  loginOrRegisterUser,
  authenticateToken,
  logout,
  getCurrentUser,
} from "./auth.js";

const router = express.Router();

// Google OAuth Login Route
router.post("/google", googleAuthMiddleware, loginOrRegisterUser);

// Get current user profile (protected route)
router.get("/profile", authenticateToken, getCurrentUser);

// Logout route
router.post("/logout", logout);

// Test protected route
router.get("/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Access granted to protected route",
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

// Middleware to check authentication status
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    authenticated: true,
    user: {
      id: req.user.id,
      googleId: req.user.google_id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role || 'patient',
    },
  });
});

export default router;
