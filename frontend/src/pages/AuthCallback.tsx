import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { FolderOpen, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "@/services/apiService";
import { userStorage } from "@/lib/userStorage";

const AuthCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");
        const error = urlParams.get("error");

        // Debug: Log the state from URL and sessionStorage
        const storedState = sessionStorage.getItem("oauth_state");
        console.log("🔑 [AuthCallback] URL state:", state);
        console.log("🔑 [AuthCallback] sessionStorage oauth_state:", storedState);

        // Check for OAuth errors
        if (error) {
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          return;
        }


        // Validate state parameter
        if (
          !state ||
          !storedState ||
          !state.startsWith(storedState.split("_")[0])
        ) {
          console.error("❌ [AuthCallback] State mismatch! URL state:", state, "Stored state:", storedState);
          setStatus("error");
          setMessage("Invalid state parameter. Possible CSRF attack.");
          return;
        }

        // Clear stored state
        sessionStorage.removeItem("oauth_state");

        if (code) {
          setStatus("loading");
          setMessage("Exchanging authorization code with Google...");

          try {
            // Send authorization code to backend
            const response = await fetch("/api/auth/google", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                code,
                redirectUri: window.location.origin + "/auth/callback"
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || "Authentication failed");
            }

            const data = await response.json();
            console.log("✅ User authenticated and saved to database:", data.user);
            console.log("📌 User ID:", data.user.id, "Google ID:", data.user.googleId);

            // IMPORTANT: Clear ALL old cached data before storing new user data
            // This prevents pre-filled data from old sessions showing up
            userStorage.removeLegacyGlobals();
            userStorage.clearAllUserData();
            
            // Clear any remaining namespaced keys from previous users
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (
                key.startsWith("health_records") ||
                key.startsWith("prescribed_medicines") ||
                key.startsWith("prescribed_tests") ||
                key.startsWith("doctor_profile")
              )) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // Store fresh authentication data from database
            localStorage.setItem("auth_token", data.accessToken);
            // Sanitize dev placeholder identity to prevent UI bleed-through
            const sanitizedUser = {
              ...data.user,
              email: (data.user.email && data.user.email.endsWith("@example.com")) ? "" : data.user.email,
              name: (data.user.name === "Development User" || (data.user.name || "").startsWith("Test User")) ? "" : data.user.name,
            };
            localStorage.setItem("user_data", JSON.stringify(sanitizedUser));
            localStorage.setItem("user_id", data.user.id.toString());
            // Store Google ID for reference
            if (data.user.googleId) {
              localStorage.setItem("google_id", data.user.googleId);
            }

            // Get role from sessionStorage
            const loginRole = sessionStorage.getItem("login_role") || "doctor";
            localStorage.setItem("user_role", loginRole);


            // Store patient ID if patient is logging in, or redirect to setup if missing
            const patientId = sessionStorage.getItem("patient_id");
            if (loginRole === "patient") {
              if (patientId) {
                localStorage.setItem("patient_id", patientId);
              } else {
                // Redirect to patient ID setup page
                setTimeout(() => navigate("/patient-id-setup"), 800);
                return;
              }
            }

            setStatus("success");
            setMessage("Authentication successful! Data saved to database.");

            // Decide destination based on existing doctor profile
            if (loginRole === "patient") {
              setTimeout(() => navigate("/patient-dashboard"), 800);
            } else {
              try {
                const profileRes = await fetch(`/api/doctor/profile`, {
                  headers: {
                    'Authorization': `Bearer ${data.accessToken}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (profileRes.ok) {
                  // Profile exists → go to dashboard
                  setTimeout(() => navigate("/dashboard"), 800);
                } else if (profileRes.status === 404) {
                  // No profile → go to setup
                  setTimeout(() => navigate("/doctor-profile-setup"), 800);
                } else {
                  // On unexpected error, default to setup to let user proceed
                  setTimeout(() => navigate("/doctor-profile-setup"), 800);
                }
              } catch (_) {
                // Network/other error → default to setup
                setTimeout(() => navigate("/doctor-profile-setup"), 800);
              }
            }
          } catch (error) {
            console.error("❌ Authentication error:", error);
            setStatus("error");
            setMessage(`Authentication failed: ${error.message}`);
          }
        } else {
          setStatus("error");
          setMessage("No authorization code received.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during authentication.");
        console.error("Auth callback error:", err);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/20 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center">
            <Logo size="lg" showText={true} to="/" />
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader className="text-center px-4 sm:px-6">
            <CardTitle className="flex items-center justify-center space-x-2 text-base sm:text-lg">
              {status === "loading" && (
                <>
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-govt-blue" />
                  <span>Authenticating...</span>
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-govt-green" />
                  <span className="text-govt-green">Success!</span>
                </>
              )}
              {status === "error" && (
                <>
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
                  <span className="text-destructive">Error</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              {message}
            </p>

            {status === "success" && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Redirecting you to your dashboard...
              </p>
            )}

            {status === "error" && (
              <div className="space-y-3 sm:space-y-4">
                <Link
                  to="/login"
                  className="inline-block bg-govt-blue text-white px-4 sm:px-6 py-2 sm:py-2 rounded text-sm sm:text-base hover:bg-govt-blue/90 transition-colors"
                >
                  Try Again
                </Link>
                <br />
                <Link
                  to="/"
                  className="text-xs sm:text-sm text-muted-foreground hover:text-govt-blue transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
