import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { Shield, Stethoscope, Users, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<"doctor" | "patient" | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "register" | null>(null);
  const [patientId, setPatientId] = useState("");

  const handleGoogleLogin = () => {
    // For patient login, require patient ID
    if (selectedRole === "patient" && !patientId.trim()) {
      toast.error("Please enter your Patient ID");
      return;
    }

    // Store patient ID in sessionStorage for use in auth callback
    if (selectedRole === "patient") {
      sessionStorage.setItem("patient_id", patientId);
      sessionStorage.setItem("login_role", "patient");
    } else {
      sessionStorage.setItem("login_role", "doctor");
    }

    // Google OAuth integration with your actual client ID
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "353620055340-i4nv19h4o58j8jhvvkquhejcb6a5kjgd.apps.googleusercontent.com";

    // Use the correct redirect URI based on environment
    // For development, we'll use the same domain pattern as production
    const isProduction =
      window.location.hostname === "medi-bridge-ebon.vercel.app";
    const redirectUri = isProduction
      ? "https://medi-bridge-ebon.vercel.app/auth/callback"
      : `${window.location.origin}/auth/callback`; // Dynamic port detection

    // Debug: Log the redirect URI to console
    console.log("🔍 Debug - Redirect URI:", redirectUri);
    console.log("🔍 Debug - Current location:", window.location.href);

    const scope = "email profile";
    const responseType = "code";
    const state = Math.random().toString(36).substring(2, 15);

    // Store state for security validation
    sessionStorage.setItem("oauth_state", state);

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=select_account`;

    window.location.href = authUrl;
  };

  const handleGoogleSignup = () => {
    // For patient signup, require patient ID
    if (selectedRole === "patient" && !patientId.trim()) {
      toast.error("Please enter your Patient ID");
      return;
    }

    // Store patient ID in sessionStorage for use in auth callback
    if (selectedRole === "patient") {
      sessionStorage.setItem("patient_id", patientId);
      sessionStorage.setItem("login_role", "patient");
    } else {
      sessionStorage.setItem("login_role", "doctor");
    }

    // Same OAuth flow for signup - you can differentiate on the backend
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "353620055340-i4nv19h4o58j8jhvvkquhejcb6a5kjgd.apps.googleusercontent.com";

    // Use the correct redirect URI based on environment
    const isProduction =
      window.location.hostname === "medi-bridge-ebon.vercel.app";
    const redirectUri = isProduction
      ? "https://medi-bridge-ebon.vercel.app/auth/callback"
      : "http://localhost:8080/auth/callback"; // Use port 8080 where Vite is running

    const scope = "email profile";
    const responseType = "code";
    const state = Math.random().toString(36).substring(2, 15) + "_signup";

    // Store state for security validation
    sessionStorage.setItem("oauth_state", state);

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${responseType}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=select_account`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/20 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-1000 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-govt-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-govt-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-200 relative z-10">
        {/* Header with Enhanced Logo */}
        <div className="text-center space-y-4 sm:space-y-6 animate-in slide-in-from-top-4 duration-600 delay-300">
          <div className="flex justify-center">
            <div className="relative animate-in zoom-in duration-500 delay-400">
              <div className="absolute inset-0 bg-gradient-to-r from-govt-blue to-govt-green rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
              <Logo size="lg" showText={true} to="/" />
            </div>
          </div>
          <div className="space-y-2 animate-in fade-in duration-500 delay-600">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-govt-blue to-govt-green bg-clip-text text-transparent">
              Welcome to MediBridge
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Choose your role to continue</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl animate-in slide-in-from-bottom-6 duration-800 delay-600 hover:shadow-2xl transition-all duration-300 mx-auto overflow-hidden">
          {/* Card Header */}
          <CardHeader className="text-center space-y-2 pb-4 sm:pb-6 px-4 sm:px-6 bg-gradient-to-b from-govt-blue/5 to-transparent border-b border-border/20 animate-in fade-in duration-600 delay-800">
            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground animate-in slide-in-from-top-2 duration-500 delay-900">
              Choose Your Account Type
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground animate-in slide-in-from-top-2 duration-500 delay-1000">
              Select whether you're a healthcare professional or a patient
            </CardDescription>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="space-y-3 sm:space-y-4 pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 animate-in fade-in duration-600 delay-1100">
            
            {!selectedRole ? (
              // Step 1: Choose Doctor or Patient
              <>
                <p className="text-center text-sm font-medium text-foreground mb-4 animate-in fade-in duration-500 delay-1150">
                  What is your role?
                </p>
                
                {/* Doctor Role Button */}
                <Button
                  onClick={() => setSelectedRole("doctor")}
                  variant="outline"
                  size="lg"
                  className="w-full h-16 sm:h-20 bg-gradient-to-r from-govt-blue/5 to-transparent hover:from-govt-blue/10 hover:to-govt-blue/5 border-2 border-govt-blue/30 hover:border-govt-blue/60 text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-govt-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-in slide-in-from-left-4 delay-1200 group"
                >
                  <div className="flex items-center justify-between w-full px-2">
                    <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-govt-blue group-hover:animate-bounce" />
                    <div className="flex-1 text-left ml-4">
                      <p className="font-bold text-sm sm:text-base">👨‍⚕️ Doctor</p>
                      <p className="text-xs text-muted-foreground">Healthcare Professional</p>
                    </div>
                    <div className="text-govt-blue/50 group-hover:text-govt-blue transition-colors">→</div>
                  </div>
                </Button>

                {/* Patient Role Button */}
                <Button
                  onClick={() => setSelectedRole("patient")}
                  variant="outline"
                  size="lg"
                  className="w-full h-16 sm:h-20 bg-gradient-to-r from-govt-green/5 to-transparent hover:from-govt-green/10 hover:to-govt-green/5 border-2 border-govt-green/30 hover:border-govt-green/60 text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-govt-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-in slide-in-from-right-4 delay-1300 group"
                >
                  <div className="flex items-center justify-between w-full px-2">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-govt-green group-hover:animate-bounce" />
                    <div className="flex-1 text-left ml-4">
                      <p className="font-bold text-sm sm:text-base">👤 Patient</p>
                      <p className="text-xs text-muted-foreground">Access Health Records</p>
                    </div>
                    <div className="text-govt-green/50 group-hover:text-govt-green transition-colors">→</div>
                  </div>
                </Button>
              </>
            ) : (
              // Step 2: Choose Sign In or Register
              <>
                <div className="flex items-center justify-between mb-4 p-3 bg-secondary/50 rounded-lg animate-in fade-in duration-500 delay-1200">
                  <p className="text-sm font-medium">
                    {selectedRole === "doctor" ? "👨‍⚕️ Doctor" : "👤 Patient"} - Choose Action
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedRole(null);
                      setAuthMode(null);
                      setPatientId("");
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:bg-secondary"
                  >
                    ← Back
                  </Button>
                </div>

                {/* Patient ID Input - Only show for patients */}
                {selectedRole === "patient" && (
                  <div className="mb-4 p-4 bg-govt-green/5 border border-govt-green/30 rounded-lg animate-in fade-in duration-500">
                    <Label htmlFor="patient-id" className="text-sm font-medium mb-2 block">
                      👤 Patient ID
                    </Label>
                    <Input
                      id="patient-id"
                      type="text"
                      placeholder="Enter your Patient ID"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Your unique Patient ID is required to access your health records
                    </p>
                  </div>
                )}

                {/* Sign In Button */}
                <Button
                  onClick={() => {
                    setAuthMode("signin");
                    handleGoogleLogin();
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full h-16 sm:h-20 bg-gradient-to-r from-govt-blue/5 to-transparent hover:from-govt-blue/10 hover:to-govt-blue/5 border-2 border-govt-blue/30 hover:border-govt-blue/60 text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-govt-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-in slide-in-from-left-4 delay-1250 group"
                >
                  <div className="flex items-center justify-between w-full px-2">
                    <LogIn className="w-6 h-6 sm:w-7 sm:h-7 text-govt-blue group-hover:animate-bounce" />
                    <div className="flex-1 text-left ml-4">
                      <p className="font-bold text-sm sm:text-base">🔑 Sign In</p>
                      <p className="text-xs text-muted-foreground">Access your existing account</p>
                    </div>
                    <div className="text-govt-blue/50 group-hover:text-govt-blue transition-colors">→</div>
                  </div>
                </Button>

                {/* Register Button */}
                <Button
                  onClick={() => {
                    setAuthMode("register");
                    handleGoogleSignup();
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full h-16 sm:h-20 bg-gradient-to-r from-govt-green/5 to-transparent hover:from-govt-green/10 hover:to-govt-green/5 border-2 border-govt-green/30 hover:border-govt-green/60 text-foreground font-semibold shadow-md hover:shadow-lg hover:shadow-govt-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 animate-in slide-in-from-right-4 delay-1300 group"
                >
                  <div className="flex items-center justify-between w-full px-2">
                    <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-govt-green group-hover:animate-bounce" />
                    <div className="flex-1 text-left ml-4">
                      <p className="font-bold text-sm sm:text-base">✍️ Register</p>
                      <p className="text-xs text-muted-foreground">Create a new account</p>
                    </div>
                    <div className="text-govt-green/50 group-hover:text-govt-green transition-colors">→</div>
                  </div>
                </Button>
              </>
            )}

            {/* Divider */}
            <div className="relative py-4 sm:py-5 animate-in fade-in duration-500 delay-1400">
              <Separator className="opacity-30" />
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center space-x-2 p-3 sm:p-4 bg-govt-green/5 border border-govt-green/20 rounded-lg animate-in slide-in-from-bottom-4 duration-500 delay-1500 hover:bg-govt-green/10 transition-colors">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-govt-green animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-foreground text-center">
                Enterprise-grade security with end-to-end encryption
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-3 sm:space-y-4 animate-in fade-in duration-600 delay-1800 px-2">
          <p className="text-xs sm:text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to our<br className="sm:hidden" />
            <Link to="/" className="text-govt-blue hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/" className="text-govt-blue hover:underline">Privacy Policy</Link>
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <Link
              to="/"
              className="hover:text-govt-blue hover:scale-110 transition-all duration-200 px-2 py-1 rounded hover:bg-govt-blue/5"
            >
              Back to Home
            </Link>
            <span className="text-border">•</span>
            <a
              href="#"
              className="hover:text-govt-blue hover:scale-110 transition-all duration-200 px-2 py-1 rounded hover:bg-govt-blue/5"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
