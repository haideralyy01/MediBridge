import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Logo from "@/components/Logo";
import { userStorage } from "@/lib/userStorage";
import Chatbot from "@/components/Chatbot";
import { toast } from "sonner";
import {
  Heart,
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Shield,
  Activity,
  Users,
  Download,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Pill,
  Microscope,
} from "lucide-react";

interface DashboardStats {
  totalRecords: number;
  recentRecords: number;
  verifiedRecords: number;
  activeConditions: number;
  activeMedications: number;
}

interface HealthRecord {
  id: number;
  title: string;
  record_type: string;
  description: string;
  icd11_code?: string;
  icd11_title?: string;
  diagnosis?: string;
  symptoms?: string[];
  namaste_name?: string;
  doctor_name?: string;
  hospital_name?: string;
  visit_date?: string;
  severity: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

interface PrescribedMedicine {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  patientId?: string;
  times?: string[];
  createdAt: string;
}

interface PrescribedTest {
  id: number;
  testName: string;
  testType: string;
  frequency: string;
  reason: string;
  instructions: string;
  prescribedDate: string;
  patientId?: string;
  createdAt: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRecords, setRecentRecords] = useState<HealthRecord[]>([]);
  const [allRecords, setAllRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [userEmail, setUserEmail] = useState<string>("");
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [prescribedMedicines, setPrescribedMedicines] = useState<PrescribedMedicine[]>([]);
  const [prescribedTests, setPrescribedTests] = useState<PrescribedTest[]>([]);
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [medicineForm, setMedicineForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "daily",
    duration: "",
    instructions: "",
    startDate: "",
    patientId: "",
    times: [] as string[],
  });
  const [testForm, setTestForm] = useState({
    testName: "",
    testType: "blood_test",
    frequency: "once",
    reason: "",
    instructions: "",
    patientId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    loadPrescribedMedicines();
    loadPrescribedTests();

    // Get user email from localStorage if available, but hide dev placeholders
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const email = user.email || "";
        setUserEmail(email.endsWith("@example.com") ? "" : email);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Check doctor profile completion
    const storedProfile = userStorage.getItem("doctor_profile");
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        setDoctorProfile(profile);
        setShowProfileReminder(!profile.profileCompleted);
      } catch (error) {
        console.error("Error parsing doctor profile:", error);
        setShowProfileReminder(true);
      }
    } else {
      setShowProfileReminder(true);
    }

    // Listen for storage changes (when health records are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("health_records:")) {
        fetchDashboardData();
      } else if (e.key.startsWith("prescribed_medicines:")) {
        loadPrescribedMedicines();
      } else if (e.key.startsWith("prescribed_tests:")) {
        loadPrescribedTests();
      }
    };

    // Listen for focus events to refresh data when user returns to dashboard
    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch health records from API first
      let healthRecords: HealthRecord[] = [];
      try {
        const token = localStorage.getItem("auth_token");
        const resp = await fetch("/api/health-records", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (resp.ok) {
          const data = await resp.json();
          healthRecords = data.data as HealthRecord[];
          userStorage.setJSON("health_records", healthRecords);
        }
      } catch (_) {
        // ignore and fall back to cache
      }

      if (healthRecords.length === 0) {
        // Fall back to cached local storage if API unavailable
        const storedRecords = userStorage.getItem("health_records");
        if (storedRecords) {
          try {
            healthRecords = JSON.parse(storedRecords);
          } catch (error) {
            console.error("Error parsing stored health records:", error);
            healthRecords = [];
          }
        }
      }

      // Calculate dynamic stats from health records
      const totalRecords = healthRecords.length;
      const recentRecords = healthRecords.filter((record) => {
        const recordDate = new Date(record.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return recordDate >= thirtyDaysAgo;
      }).length;

      const verifiedRecords = healthRecords.filter(
        (record) => record.verification_status === "verified"
      ).length;

      // Count active conditions (unique diagnoses/conditions)
      const activeConditions = new Set(
        healthRecords
          .filter(
            (record) =>
              record.record_type === "consultation" ||
              record.record_type === "diagnosis"
          )
          .map((record) => record.icd11_code || record.title)
          .filter(Boolean)
      ).size;

      // Count medications (prescription records)
      const activeMedications = healthRecords.filter(
        (record) =>
          record.record_type === "prescription" ||
          record.record_type === "medication"
      ).length;

      const calculatedStats: DashboardStats = {
        totalRecords,
        recentRecords,
        verifiedRecords,
        activeConditions,
        activeMedications,
      };

      setStats(calculatedStats);

      // Set all records (sorted by date, most recent first)
      const sortedAllRecords = healthRecords.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllRecords(sortedAllRecords);

      // Set recent records (last 5 records for overview)
      const recentRecordsForOverview = sortedAllRecords.slice(0, 5);
      setRecentRecords(recentRecordsForOverview);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set default stats if there's an error
      setStats({
        totalRecords: 0,
        recentRecords: 0,
        verifiedRecords: 0,
        activeConditions: 0,
        activeMedications: 0,
      });
      setRecentRecords([]);
      setAllRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescribedMedicines = async () => {
    try {
      // API-first: fetch from backend
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/medications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize API rows to UI shape
        const normalized = (data.data || []).map((row: any) => ({
          id: row.id,
          medicineName: row.medication_name,
          dosage: row.dosage,
          frequency: row.frequency,
          duration: (row.notes || "").match(/duration=([^;]+)/)?.[1] || "",
          instructions: (row.notes || "").match(/instructions=([^;]+)/)?.[1] || "",
          startDate: row.start_date,
          createdAt: row.created_at,
        }));
        setPrescribedMedicines(normalized);
        // Cache for fallback
        userStorage.setJSON("prescribed_medicines", normalized);
        return;
      }

      // Fallback to cached localStorage
      const stored = userStorage.getItem("prescribed_medicines");
      if (stored) {
        setPrescribedMedicines(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load prescribed medicines:", error);
      // Fallback to local cache
      const stored = userStorage.getItem("prescribed_medicines");
      if (stored) {
        try {
          setPrescribedMedicines(JSON.parse(stored));
        } catch (_) {
          setPrescribedMedicines([]);
        }
      }
    }
  };

  const loadPrescribedTests = async () => {
    try {
      // API-first: fetch from backend
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/tests", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize API rows to UI shape
        const normalized = (data.data || []).map((row: any) => ({
          id: row.id,
          testName: row.test_name,
          testType: row.test_type,
          frequency: row.frequency,
          reason: row.reason,
          instructions: row.instructions,
          prescribedDate: row.created_at,
          createdAt: row.created_at,
        }));
        setPrescribedTests(normalized);
        // Cache for fallback
        userStorage.setJSON("prescribed_tests", normalized);
        return;
      }

      // Fallback to cached localStorage
      const stored = userStorage.getItem("prescribed_tests");
      if (stored) {
        setPrescribedTests(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load prescribed tests:", error);
      // Fallback to local cache
      const stored = userStorage.getItem("prescribed_tests");
      if (stored) {
        try {
          setPrescribedTests(JSON.parse(stored));
        } catch (_) {
          setPrescribedTests([]);
        }
      }
    }
  };

  const handleAddMedicine = async () => {
    if (!medicineForm.medicineName || !medicineForm.dosage || !medicineForm.startDate || !medicineForm.patientId) {
      toast.error("Please fill all required fields including Patient ID");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      
      // Save to backend API
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicationName: medicineForm.medicineName,
          dosage: medicineForm.dosage,
          frequency: medicineForm.frequency,
          prescribedBy: userEmail || "Doctor",
          startDate: medicineForm.startDate,
          endDate: null,
          notes: `duration=${medicineForm.duration};instructions=${medicineForm.instructions};patientId=${medicineForm.patientId};times=${medicineForm.times.join(",")}`,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save medication");
      }

      const data = await response.json();
      
      // Map API response to UI shape
      const newMedicine: PrescribedMedicine = {
        id: data.data.id,
        medicineName: data.data.medication_name,
        dosage: data.data.dosage,
        frequency: data.data.frequency,
        duration: medicineForm.duration,
        instructions: medicineForm.instructions,
        startDate: data.data.start_date,
        patientId: medicineForm.patientId,
        times: medicineForm.times,
        createdAt: data.data.created_at,
      };

      const updated = [...prescribedMedicines, newMedicine];
      setPrescribedMedicines(updated);
      userStorage.setJSON("prescribed_medicines", updated);

      // Also add to patient reminders
      const remindersStored = localStorage.getItem("patient_reminders") || "[]";
      const reminders = JSON.parse(remindersStored);
      const patientReminder = {
        id: newMedicine.id,
        type: "medicine" as const,
        title: medicineForm.medicineName,
        description: `Dosage: ${medicineForm.dosage}. ${medicineForm.instructions}`,
        reminderDate: medicineForm.startDate,
        reminderTime: "08:00",
        frequency: medicineForm.frequency,
        patientId: medicineForm.patientId,
        times: medicineForm.times,
      };
      reminders.push(patientReminder);
      localStorage.setItem("patient_reminders", JSON.stringify(reminders));

      toast.success("Medicine prescribed successfully and saved to database");
      setMedicineForm({
        medicineName: "",
        dosage: "",
        frequency: "daily",
        duration: "",
        instructions: "",
        startDate: "",
        patientId: "",
        times: [],
      });
      setIsMedicineDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to prescribe medicine:", error);
      toast.error(error?.message || "Failed to prescribe medicine");
    }
  };

  const handleAddTest = async () => {
    if (!testForm.testName || !testForm.testType || !testForm.patientId) {
      toast.error("Please fill all required fields including Patient ID");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      
      // Save to backend API
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testName: testForm.testName,
          testType: testForm.testType,
          frequency: testForm.frequency,
          reason: testForm.reason,
          instructions: `patientId=${testForm.patientId};${testForm.instructions}`,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save test");
      }

      const data = await response.json();
      
      // Map API response to UI shape
      const newTest: PrescribedTest = {
        id: data.data.id,
        testName: data.data.test_name,
        testType: data.data.test_type,
        frequency: data.data.frequency,
        reason: data.data.reason,
        instructions: testForm.instructions,
        prescribedDate: data.data.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        patientId: testForm.patientId,
        createdAt: data.data.created_at,
      };

      const updated = [...prescribedTests, newTest];
      setPrescribedTests(updated);
      userStorage.setJSON("prescribed_tests", updated);

      // Also add to patient lab reports
      const labReportsStored = localStorage.getItem("patient_lab_reports") || "[]";
      const labReports = JSON.parse(labReportsStored);
      const patientLabReport = {
        id: newTest.id,
        testName: testForm.testName,
        date: new Date().toISOString().split("T")[0],
        status: "pending" as const,
        testType: testForm.testType,
        frequency: testForm.frequency,
        patientId: testForm.patientId,
      };
      labReports.push(patientLabReport);
      localStorage.setItem("patient_lab_reports", JSON.stringify(labReports));

      toast.success("Test prescribed successfully and saved to database");
      setTestForm({
        testName: "",
        testType: "blood_test",
        frequency: "once",
        reason: "",
        instructions: "",
        patientId: "",
      });
      setIsTestDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to prescribe test:", error);
      toast.error(error?.message || "Failed to prescribe test");
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // Delete from backend API
      const response = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete medication");
      }

      const updated = prescribedMedicines.filter((m) => m.id !== id);
      setPrescribedMedicines(updated);
      userStorage.setJSON("prescribed_medicines", updated);
      toast.success("Medicine removed successfully");
    } catch (error: any) {
      console.error("Failed to delete medicine:", error);
      toast.error(error?.message || "Failed to delete medicine");
    }
  };

  const handleDeleteTest = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      
      // Delete from backend API
      const response = await fetch(`/api/tests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete test");
      }

      const updated = prescribedTests.filter((t) => t.id !== id);
      setPrescribedTests(updated);
      userStorage.setJSON("prescribed_tests", updated);
      toast.success("Test removed successfully");
    } catch (error: any) {
      console.error("Failed to delete test:", error);
      toast.error(error?.message || "Failed to delete test");
    }
  };

  const getVerificationRate = () => {
    if (!stats || stats.totalRecords === 0) return 0;
    return Math.round((stats.verifiedRecords / stats.totalRecords) * 100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      // Remove record from localStorage
      const storedRecords = userStorage.getItem("health_records");
      if (storedRecords) {
        const healthRecords = JSON.parse(storedRecords);
        const updatedRecords = healthRecords.filter(
          (record: HealthRecord) => record.id !== recordId
        );
        userStorage.setJSON("health_records", updatedRecords);

        // Refresh dashboard data
        fetchDashboardData();

        // Show success message
        toast.success("Health record deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete record:", error);
      toast.error("Failed to delete health record");
    }
  };

  const handleEditRecord = (recordId: number) => {
    // Navigate to health records page with edit mode
    // You can pass the record ID as a URL parameter or state
    navigate(`/health-records?edit=${recordId}`);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("oauth_state");

    // Clear any other user data if stored
    localStorage.removeItem("user_data");

    // Redirect to home page
    navigate("/");
  };

  const handleExportToExcel = () => {
    try {
      if (allRecords.length === 0) {
        toast.error("No records to export");
        return;
      }

      // Prepare data for Excel export
      const exportData = allRecords.map((record) => ({
        "Patient Name": record.title,
        "Record Type": record.record_type.replace("_", " ").toUpperCase(),
        Description: record.description,
        "ICD-11 Code": record.icd11_code || "",
        "ICD-11 Title": record.icd11_title || "",
        Diagnosis: record.diagnosis || "",
        Symptoms: record.symptoms ? record.symptoms.join(", ") : "",
        "Hindi Name": record.namaste_name || "",
        "Doctor Name": record.doctor_name || "",
        "Hospital Name": record.hospital_name || "",
        "Visit Date": record.visit_date || "",
        Severity: record.severity.toUpperCase(),
        "Verification Status": record.verification_status.toUpperCase(),
        "Created Date": new Date(record.created_at).toLocaleDateString(),
        "Last Updated": new Date(record.updated_at).toLocaleDateString(),
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 20 }, // Patient Name
        { wch: 15 }, // Record Type
        { wch: 30 }, // Description
        { wch: 12 }, // ICD-11 Code
        { wch: 25 }, // ICD-11 Title
        { wch: 25 }, // Diagnosis
        { wch: 30 }, // Symptoms
        { wch: 20 }, // Hindi Name
        { wch: 20 }, // Doctor Name
        { wch: 25 }, // Hospital Name
        { wch: 12 }, // Visit Date
        { wch: 10 }, // Severity
        { wch: 15 }, // Verification Status
        { wch: 12 }, // Created Date
        { wch: 12 }, // Last Updated
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Health Records");

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `MediBridge_Health_Records_${currentDate}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      toast.success(
        `Successfully exported ${allRecords.length} records to ${filename}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export records. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Logo size="md" showText={true} to="/" />
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              👨‍⚕️ Doctor Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage patient health records and consultations
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {doctorProfile?.name ? `Welcome back, Dr. ${doctorProfile.name}` : `Welcome back`}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            className="flex items-center justify-center gap-2 w-full sm:w-auto text-base font-semibold py-6 sm:py-2 bg-gradient-to-r from-govt-blue to-govt-green hover:from-govt-blue/90 hover:to-govt-green/90 text-white shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate("/health-records")}
          >
            <FileText className="h-5 w-5" />
            <span>+ New Health Record</span>
          </Button>
          {doctorProfile && (
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
              onClick={() => navigate("/doctor-profile-setup")}
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Profile</span>
            </Button>
          )}
          <Button
            className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm"
            onClick={handleExportToExcel}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Data</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 w-full sm:w-auto hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Completion Reminder */}
      {showProfileReminder && (
        <Card className="mb-6 border-govt-orange bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-govt-orange" />
                <div>
                  <h3 className="font-semibold text-govt-orange">Complete Your Doctor Profile</h3>
                  <p className="text-sm text-gray-600">
                    Complete your professional profile to help patients find and trust you.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => navigate("/doctor-profile-setup")}
                  className="bg-govt-orange hover:bg-govt-orange/90"
                >
                  Complete Profile
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowProfileReminder(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <Card className="border-l-4 border-l-govt-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Records</CardTitle>
            <Users className="h-4 w-4 text-govt-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRecords || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentRecords || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-govt-green">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Records
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-govt-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.verifiedRecords || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {getVerificationRate()}% verified
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-govt-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Diagnoses
            </CardTitle>
            <Heart className="h-4 w-4 text-govt-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeConditions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Unique conditions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prescriptions
            </CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeMedications || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active medications
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVerificationRate()}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${getVerificationRate()}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Patient Overview</TabsTrigger>
          <TabsTrigger value="records">Consultations</TabsTrigger>
          <TabsTrigger value="medicines">💊 Medicines</TabsTrigger>
          <TabsTrigger value="tests">🔬 Tests</TabsTrigger>
          <TabsTrigger value="reports">📊 Reports</TabsTrigger>
          <TabsTrigger value="analytics">Clinical Analytics</TabsTrigger>
          <TabsTrigger value="verification">Verification Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Consultations</CardTitle>
                <CardDescription>
                  Latest patient consultation records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-transparent"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{record.title}</h4>
                          {record.icd11_code && (
                            <Badge variant="secondary" className="text-xs">
                              {record.icd11_code}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize mt-1">
                          Type: {record.record_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-col gap-1">
                          <Badge className={getSeverityColor(record.severity)}>
                            {record.severity}
                          </Badge>
                          <Badge
                            className={getStatusColor(
                              record.verification_status
                            )}
                          >
                            {record.verification_status}
                          </Badge>
                        </div>

                        {/* Compact Action Buttons for Overview */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRecord(record.id)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Edit consultation"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete consultation"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Health Record
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {record.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Record
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {recentRecords.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">No health records yet</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        onClick={() => navigate("/health-records")}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Add Your First Record
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          // Quick create a sample record
                          const sampleRecord = {
                            id: Date.now(),
                            title: "John Doe",
                            record_type: "consultation",
                            description:
                              "This is a sample health record for demonstration purposes.",
                            icd11_code: "8A00",
                            icd11_title: "Primary headache disorders",
                            diagnosis: "Tension-type headache",
                            symptoms: ["headache", "stress"],
                            namaste_name: "स्वास्थ्य रिकॉर्ड (Health Record)",
                            doctor_name: "Dr. Sample Physician",
                            hospital_name: "Sample Medical Center",
                            visit_date: new Date().toISOString().split("T")[0],
                            severity: "mild",
                            verification_status: "pending",
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          };

                          try {
                            // Get existing records from localStorage
                            const existingRecords =
                              localStorage.getItem("health_records");
                            const records = existingRecords
                              ? JSON.parse(existingRecords)
                              : [];

                            // Add the new sample record
                            const updatedRecords = [...records, sampleRecord];

                            // Save back to localStorage
                            localStorage.setItem(
                              "health_records",
                              JSON.stringify(updatedRecords)
                            );

                            // Refresh dashboard data
                            fetchDashboardData();

                            toast.success(
                              "Sample health record added successfully"
                            );
                          } catch (error) {
                            console.error(
                              "Failed to create sample record:",
                              error
                            );
                            toast.error("Failed to create sample record");
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Activity className="h-4 w-4" />
                        Quick Sample
                      </Button>
                    </div>
                  </div>
                )}
                {recentRecords.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full flex items-center gap-2"
                      onClick={() => navigate("/health-records")}
                    >
                      <FileText className="h-4 w-4" />
                      View All Records & Add New
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Progress</CardTitle>
                <CardDescription>
                  Track your health record verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Verification</span>
                      <span>{getVerificationRate()}%</span>
                    </div>
                    <Progress value={getVerificationRate()} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.verifiedRecords || 0}
                      </div>
                      <div className="text-xs text-gray-600">Verified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(stats?.totalRecords || 0) -
                          (stats?.verifiedRecords || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {stats?.totalRecords || 0}
                      </div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <CardTitle>All Health Records</CardTitle>
                  <CardDescription>
                    View and manage all your health records
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/health-records")}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <FileText className="h-4 w-4" />
                    View All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allRecords.length > 0 ? (
                <div className="space-y-4">
                  {allRecords.slice(0, 10).map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1 space-y-2 sm:space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h4 className="font-medium text-lg">
                              {record.title}
                            </h4>
                            <div className="flex gap-2">
                              <Badge
                                className={getSeverityColor(record.severity)}
                              >
                                {record.severity}
                              </Badge>
                              <Badge
                                className={getStatusColor(
                                  record.verification_status
                                )}
                              >
                                {record.verification_status}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 capitalize">
                            Type: {record.record_type.replace("_", " ")}
                          </p>

                          {record.description && (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {record.description}
                            </p>
                          )}

                          {record.icd11_code && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText className="h-3 w-3" />
                              <span className="font-medium">
                                {record.icd11_code}
                              </span>
                              {record.icd11_title && (
                                <span>- {record.icd11_title}</span>
                              )}
                            </div>
                          )}

                          {record.doctor_name && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>Dr. {record.doctor_name}</span>
                              {record.hospital_name && (
                                <span>at {record.hospital_name}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created:{" "}
                              {new Date(record.created_at).toLocaleDateString()}
                            </div>
                            {record.visit_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Visit:{" "}
                                {new Date(
                                  record.visit_date
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 sm:ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRecord(record.id)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Health Record
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {record.title}"? This action cannot be undone
                                  and will permanently remove this health record
                                  from your account.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Record
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}

                  {allRecords.length > 10 && (
                    <div className="text-center py-2 text-sm text-gray-500 border-t">
                      Showing 10 of {allRecords.length} records
                    </div>
                  )}

                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/health-records")}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View All Records
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    No health records yet. Start by creating your first record.
                  </p>
                  <Button
                    onClick={() => navigate("/health-records")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Add Your First Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <CardTitle>💊 Prescribe Medicine</CardTitle>
                  <CardDescription>
                    Prescribe medicines to your patients
                  </CardDescription>
                </div>
                <Dialog open={isMedicineDialogOpen} onOpenChange={setIsMedicineDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-govt-green hover:bg-govt-green/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Prescribe Medicine
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Prescribe Medicine</DialogTitle>
                      <DialogDescription>
                        Add a medicine prescription for the patient
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="space-y-2">
                        <Label htmlFor="patient-id">Patient ID *</Label>
                        <Input
                          id="patient-id"
                          placeholder="e.g., P12345"
                          value={medicineForm.patientId}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              patientId: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="med-name">Medicine Name *</Label>
                        <Input
                          id="med-name"
                          placeholder="e.g., Aspirin"
                          value={medicineForm.medicineName}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              medicineName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dosage">Dosage *</Label>
                        <Input
                          id="dosage"
                          placeholder="e.g., 500mg"
                          value={medicineForm.dosage}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              dosage: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="med-frequency">Frequency *</Label>
                        <select
                          id="med-frequency"
                          className="w-full px-3 py-2 border border-input rounded-md"
                          value={medicineForm.frequency}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              frequency: e.target.value,
                            })
                          }
                        >
                          <option value="daily">Daily</option>
                          <option value="twice_daily">Twice Daily</option>
                          <option value="thrice_daily">Thrice Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      
                      {/* Time Selection */}
                      {medicineForm.frequency !== "weekly" && medicineForm.frequency !== "monthly" && (
                        <div className="space-y-2">
                          <Label>Select Times</Label>
                          <div className="space-y-2">
                            {(() => {
                              const getDefaultTimes = (freq: string) => {
                                switch (freq) {
                                  case "daily": return ["08:00"];
                                  case "twice_daily": return ["08:00", "20:00"];
                                  case "thrice_daily": return ["08:00", "14:00", "20:00"];
                                  default: return ["08:00"];
                                }
                              };
                              
                              const defaultTimes = getDefaultTimes(medicineForm.frequency);
                              const currentTimes = medicineForm.times.length > 0 ? medicineForm.times : defaultTimes;
                              
                              return (
                                <div className="space-y-2">
                                  {currentTimes.map((time, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Input
                                        type="time"
                                        value={time}
                                        onChange={(e) => {
                                          const newTimes = [...currentTimes];
                                          newTimes[index] = e.target.value;
                                          setMedicineForm({
                                            ...medicineForm,
                                            times: newTimes,
                                          });
                                        }}
                                        className="flex-1"
                                      />
                                      {currentTimes.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const newTimes = currentTimes.filter((_, i) => i !== index);
                                            setMedicineForm({
                                              ...medicineForm,
                                              times: newTimes,
                                            });
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setMedicineForm({
                                        ...medicineForm,
                                        times: [...currentTimes, "12:00"],
                                      });
                                    }}
                                    className="w-full"
                                  >
                                    + Add Time
                                  </Button>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 7 days, 1 month"
                          value={medicineForm.duration}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              duration: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="med-instructions">Instructions</Label>
                        <Textarea
                          id="med-instructions"
                          placeholder="e.g., Take after breakfast with water"
                          value={medicineForm.instructions}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              instructions: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date *</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={medicineForm.startDate}
                          onChange={(e) =>
                            setMedicineForm({
                              ...medicineForm,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button onClick={handleAddMedicine} className="w-full sticky bottom-0 bg-white border-t pt-4 mt-4">
                        Prescribe Medicine
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {prescribedMedicines.length > 0 ? (
                <div className="space-y-4">
                  {prescribedMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-transparent hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-govt-green" />
                            <h4 className="font-semibold text-lg">
                              {medicine.medicineName}
                            </h4>
                          </div>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Dosage:</span>{" "}
                              {medicine.dosage}
                            </p>
                            <p>
                              <span className="font-medium">Frequency:</span>{" "}
                              {medicine.frequency}
                            </p>
                            {medicine.duration && (
                              <p>
                                <span className="font-medium">Duration:</span>{" "}
                                {medicine.duration}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Start Date:</span>{" "}
                              {new Date(medicine.startDate).toLocaleDateString()}
                            </p>
                            {medicine.patientId && (
                              <p>
                                <span className="font-medium">Patient ID:</span>{" "}
                                {medicine.patientId}
                              </p>
                            )}
                            {medicine.times && medicine.times.length > 0 && (
                              <p>
                                <span className="font-medium">Times:</span>{" "}
                                {medicine.times.join(", ")}
                              </p>
                            )}
                            {medicine.instructions && (
                              <p className="mt-2 text-gray-700">
                                <span className="font-medium">Instructions:</span>{" "}
                                {medicine.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No medicines prescribed yet. Start by prescribing a medicine above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <CardTitle>🔬 Prescribe Tests</CardTitle>
                  <CardDescription>
                    Prescribe lab tests and medical tests to your patients
                  </CardDescription>
                </div>
                <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-govt-blue hover:bg-govt-blue/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Prescribe Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Prescribe Test</DialogTitle>
                      <DialogDescription>
                        Add a test prescription for the patient
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="test-patient-id">Patient ID *</Label>
                        <Input
                          id="test-patient-id"
                          placeholder="e.g., P12345"
                          value={testForm.patientId}
                          onChange={(e) =>
                            setTestForm({
                              ...testForm,
                              patientId: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test-name">Test Name *</Label>
                        <Input
                          id="test-name"
                          placeholder="e.g., Blood Test, X-Ray"
                          value={testForm.testName}
                          onChange={(e) =>
                            setTestForm({
                              ...testForm,
                              testName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test-type">Test Type *</Label>
                        <select
                          id="test-type"
                          className="w-full px-3 py-2 border border-input rounded-md"
                          value={testForm.testType}
                          onChange={(e) =>
                            setTestForm({
                              ...testForm,
                              testType: e.target.value,
                            })
                          }
                        >
                          <option value="blood_test">Blood Test</option>
                          <option value="urine_test">Urine Test</option>
                          <option value="xray">X-Ray</option>
                          <option value="ultrasound">Ultrasound</option>
                          <option value="ct_scan">CT Scan</option>
                          <option value="mri">MRI</option>
                          <option value="ecg">ECG</option>
                          <option value="glucose_test">Glucose Test</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test-frequency">How Often? *</Label>
                        <select
                          id="test-frequency"
                          className="w-full px-3 py-2 border border-input rounded-md"
                          value={testForm.frequency}
                          onChange={(e) =>
                            setTestForm({
                              ...testForm,
                              frequency: e.target.value,
                            })
                          }
                        >
                          <option value="once">Once (One time only)</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Every 3 Months</option>
                          <option value="half_yearly">Every 6 Months</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test-reason">Reason for Test</Label>
                        <Textarea
                          id="test-reason"
                          placeholder="e.g., Follow-up for diabetes screening"
                          value={testForm.reason}
                          onChange={(e) =>
                            setTestForm({
                              ...testForm,
                              reason: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="test-instructions">
                          Special Instructions
                        </Label>
                        <Textarea
                          id="test-instructions"
                          placeholder="e.g., Fasting required, Avoid medicines before test"
                          value={testForm.instructions}
                          onChange={(e) =>
                            setTestForm({
                              ...testForm,
                              instructions: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button onClick={handleAddTest} className="w-full">
                        Prescribe Test
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {prescribedTests.length > 0 ? (
                <div className="space-y-4">
                  {prescribedTests.map((test) => (
                    <div
                      key={test.id}
                      className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-transparent hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Microscope className="h-5 w-5 text-govt-blue" />
                            <h4 className="font-semibold text-lg">
                              {test.testName}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {test.testType}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Frequency:</span>{" "}
                              {test.frequency}
                            </p>
                            <p>
                              <span className="font-medium">Prescribed:</span>{" "}
                              {new Date(test.prescribedDate).toLocaleDateString()}
                            </p>
                            {test.patientId && (
                              <p>
                                <span className="font-medium">Patient ID:</span>{" "}
                                {test.patientId}
                              </p>
                            )}
                            {test.reason && (
                              <p>
                                <span className="font-medium">Reason:</span>{" "}
                                {test.reason}
                              </p>
                            )}
                            {test.instructions && (
                              <p className="mt-2 text-gray-700">
                                <span className="font-medium">Instructions:</span>{" "}
                                {test.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTest(test.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No tests prescribed yet. Start by prescribing a test above.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>📊 Patient Reports</CardTitle>
              <CardDescription>
                View all patient lab reports and test results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const labReports = JSON.parse(localStorage.getItem("patient_lab_reports") || "[]");
                return labReports.length > 0 ? (
                  <div className="space-y-4">
                    {labReports.map((report: any) => (
                      <div
                        key={report.id}
                        className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-transparent hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Microscope className="h-5 w-5 text-purple-600" />
                              <h4 className="font-semibold text-lg">
                                {report.testName}
                              </h4>
                              <Badge 
                                className={report.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-gray-100 text-gray-800'}
                              >
                                {report.status}
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Test Type:</span> {report.testType}
                              </p>
                              <p>
                                <span className="font-medium">Date:</span> {new Date(report.date).toLocaleDateString()}
                              </p>
                              {report.patientId && (
                                <p>
                                  <span className="font-medium">Patient ID:</span> {report.patientId}
                                </p>
                              )}
                              {report.frequency && (
                                <p>
                                  <span className="font-medium">Frequency:</span> {report.frequency}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No lab reports yet. Reports will appear here when tests are prescribed.
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Health Analytics</CardTitle>
              <CardDescription>
                Insights and trends from your health data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Advanced analytics and charting coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Center</CardTitle>
              <CardDescription>
                Manage verification status of your health records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Verification management interface coming soon...
                </p>
                <Button
                  className="mt-4"
                  onClick={() => navigate("/health-records")}
                >
                  Start Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* AI Chatbot */}
      <Chatbot 
        userRole="doctor" 
        userContext={{ 
          totalRecords: stats?.totalRecords || 0,
          recentRecords: recentRecords,
          prescribedMedicines: prescribedMedicines,
          prescribedTests: prescribedTests
        }} 
      />
    </div>
  );
};

export default Dashboard;
