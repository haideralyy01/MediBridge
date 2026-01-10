import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorProfileForm from "@/components/DoctorProfileForm";
import { toast } from "sonner";

interface DoctorProfileData {
  name: string;
  licenseNumber: string;
  specialties: string[];
  address: string;
  phone: string;
  website: string;
  description: string;
  hospital?: string;
  yearsOfExperience?: number;
}

const DoctorProfileSetup = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [existingProfile, setExistingProfile] = useState<DoctorProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAndProfile = async () => {
      // Check if user is authenticated
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        navigate("/login");
        return;
      }

      // Get user data
      const userData = localStorage.getItem("user_data");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserEmail(user.email || "");
          setUserName(user.name || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      // Try to fetch existing doctor profile from backend
      try {
        const response = await fetch(`/api/doctor/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setExistingProfile({
              name: data.profile.name || "",
              licenseNumber: data.profile.licenseNumber || "",
              specialties: data.profile.specialties || [],
              address: data.profile.address || "",
              phone: data.profile.phone || "",
              website: data.profile.website || "",
              description: data.profile.description || "",
              hospital: data.profile.hospital || "",
              yearsOfExperience: data.profile.yearsOfExperience || 0
            });
            setIsEditing(true);
          }
        } else if (response.status !== 404) {
          console.error("Error fetching doctor profile:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndProfile();
  }, [navigate]);

  const handleProfileSubmit = async (profileData: DoctorProfileData) => {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) {
      toast.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`/api/doctor/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear any old localStorage doctor profile data
        localStorage.removeItem("doctor_profile");
        
        // Update user data to mark profile as completed
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const user = JSON.parse(userData);
          user.profileCompleted = true;
          user.role = 'doctor';
          localStorage.setItem("user_data", JSON.stringify(user));
        }

        toast.success(isEditing ? "Doctor profile updated successfully!" : "Doctor profile created successfully!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Failed to save profile");
      }
    } catch (error) {
      console.error("Error saving doctor profile:", error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleSkip = () => {
    // Mark as skipped but not completed
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const user = JSON.parse(userData);
      user.profileSkipped = true;
      localStorage.setItem("user_data", JSON.stringify(user));
    }
    
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DoctorProfileForm
      onSubmit={handleProfileSubmit}
      onSkip={!isEditing ? handleSkip : undefined}
      userEmail={userEmail}
      userName={(userName && userEmail && !userEmail.endsWith("@example.com") && userName !== "Development User" && !userName.startsWith("Test User")) ? userName : ""}
      initialData={existingProfile}
      isEditing={isEditing}
    />
  );
};

export default DoctorProfileSetup;