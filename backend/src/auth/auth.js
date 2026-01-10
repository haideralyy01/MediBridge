import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { db } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Google OAuth2 client with credentials
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// JWT Helper Functions
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return { accessToken };
};

// Google OAuth Authentication Middleware
export const googleAuthMiddleware = async (req, res, next) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code is required",
      });
    }

    // Development mode: Use mock authentication ONLY if credentials not set OR code is "dev"
    const isDevMode = process.env.NODE_ENV === "development";
    const hasRealCredentials = process.env.GOOGLE_CLIENT_ID && 
                               process.env.GOOGLE_CLIENT_ID !== "your-client-id-here";
    const isDevCode = code === "dev" || code === "test";

    // If dev mode with no real credentials, or explicit dev code, use mock auth
    if (isDevMode && (!hasRealCredentials || isDevCode)) {
      // Use a CONSISTENT dev user (not random) to avoid duplicate accounts
      const fixedEmail = process.env.DEV_FIXED_EMAIL || "dev@medibridge.local";
      const fixedName = process.env.DEV_FIXED_NAME || "Development User";
      const googleId = `dev-${fixedEmail.replace(/[^a-z0-9]/gi, '')}`;

      console.log(`⚠️  Using mock authentication for dev user: ${fixedEmail}`);

      req.googleUser = {
        googleId,
        email: fixedEmail,
        name: fixedName,
        profilePicture: "https://via.placeholder.com/150",
        emailVerified: true,
      };
      return next();
    }

    // Production or dev with real credentials: Exchange authorization code for real tokens
    try {
      const { tokens } = await googleClient.getToken({
        code,
        redirect_uri: redirectUri || process.env.GOOGLE_REDIRECT_URI,
      });

      console.log("✅ Authorization code exchanged successfully");

      // Verify the ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(401).json({
          success: false,
          message: "Invalid Google token",
        });
      }

      // Extract user information from Google token
      const googleUserData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified,
      };

      console.log(`✅ Google user authenticated: ${googleUserData.email}`);

      // Check if email is verified
      if (!googleUserData.emailVerified) {
        return res.status(401).json({
          success: false,
          message: "Email not verified with Google",
        });
      }

      // Store Google user data in request for next middleware
      req.googleUser = googleUserData;
      next();
    } catch (googleError) {
      console.error("❌ Google OAuth Error:", googleError.message);
      
      // In development, fallback to mock auth with CONSISTENT user
      if (isDevMode) {
        const fixedEmail = process.env.DEV_FIXED_EMAIL || "dev@medibridge.local";
        const fixedName = process.env.DEV_FIXED_NAME || "Development User";
        const googleId = `dev-${fixedEmail.replace(/[^a-z0-9]/gi, '')}`;

        console.warn(`⚠️  Google OAuth failed, using consistent dev user: ${fixedEmail}`);

        req.googleUser = {
          googleId,
          email: fixedEmail,
          name: fixedName,
          profilePicture: "https://via.placeholder.com/150",
          emailVerified: true,
        };
        return next();
      }
      // In production, throw the error
      throw googleError;
    }
  } catch (error) {
    console.error("❌ Google Auth Error:", error.message || error);
    return res.status(401).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? `Failed to authenticate with Google: ${error.message || error}`
          : "Failed to authenticate with Google",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Login or Register User
export const loginOrRegisterUser = async (req, res) => {
  try {
    const { googleUser } = req;

    if (!googleUser) {
      return res.status(400).json({
        success: false,
        message: "Google authentication required",
      });
    }

    // Normalize email for consistent matching
    const normalizedEmail = (googleUser.email || "").toLowerCase();
    if (normalizedEmail) googleUser.email = normalizedEmail;

    // Check if user exists by Google ID
    let user = await db.findUserByGoogleId(googleUser.googleId);

    if (!user) {
      // Link by email
      // In development, default to true unless explicitly set to "false"
      const linkByEmailEnv = (process.env.AUTH_LINK_BY_EMAIL || "").toLowerCase();
      const linkByEmail =
        process.env.NODE_ENV === "development"
          ? linkByEmailEnv === "true" || linkByEmailEnv === "" // default on in dev
          : linkByEmailEnv === "true";
      if (linkByEmail) {
        const existingByEmail = await db.findUserByEmail(googleUser.email);
        if (existingByEmail) {
          await db.query(
            "UPDATE users SET google_id = $1, email = $2, profile_picture = $3, last_login = CURRENT_TIMESTAMP WHERE id = $4",
            [googleUser.googleId, normalizedEmail || existingByEmail.email, googleUser.profilePicture, existingByEmail.id]
          );
          user = await db.findUserByGoogleId(googleUser.googleId);
        }
      }

      if (!user) {
        // Create new user
        user = await db.createUser({
          googleId: googleUser.googleId,
          email: googleUser.email,
          name: googleUser.name,
          profilePicture: googleUser.profilePicture,
        });
      }
    } else {
      // Update last login for existing user
      user = await db.updateUserLogin(user.id);
    }

    // Generate JWT tokens
    const { accessToken } = generateTokens(user);

    // Set secure HTTP-only cookie (optional)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      accessToken,
    });
  } catch (error) {
    console.error("❌ Login/Register Error:", error);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? `Internal server error during authentication: ${error.message}`
          : "Internal server error during authentication",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// JWT Authentication Middleware for Protected Routes
export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Check for token in cookies (if using HTTP-only cookies)
    if (!token && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to ensure user still exists
    const user = await db.query("SELECT * FROM users WHERE id = $1", [
      decoded.id,
    ]);

    if (!user.rows[0]) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Add user data to request
    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error("❌ Token Auth Error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Token authentication failed",
    });
  }
};

// Logout middleware
export const logout = async (req, res) => {
  try {
    // Clear HTTP-only cookie
    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("❌ Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    console.error("❌ Get User Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
};
