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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DiseaseAutocomplete } from "@/components/DiseaseAutocomplete";
import Logo from "@/components/Logo";
import {
  Plus,
  FileText,
  Calendar,
  User,
  Building,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Pill,
  Microscope,
  X,
} from "lucide-react";
import { toast } from "sonner";

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
  patient_id?: string;
}

interface NewRecordForm {
  recordType: string;
  title: string;
  description: string;
  icd11Code: string;
  icd11Title: string;
  diagnosis: string;
  symptoms: string;
  doctorName: string;
  hospitalName: string;
  visitDate: string;
  severity: string;
  namasteName: string;
  patientId: string;
}

const HealthRecords = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [formData, setFormData] = useState<NewRecordForm>({
    recordType: "",
    title: "",
    description: "",
    icd11Code: "",
    icd11Title: "",
    diagnosis: "",
    namasteName: "",
    symptoms: "",
    doctorName: "",
    hospitalName: "",
    visitDate: "",
    severity: "mild",
    patientId: "",
  });

  // Medicine and Test Prescription States
  const [prescribedMedicines, setPrescribedMedicines] = useState<any[]>([]);
  const [prescribedTests, setPrescribedTests] = useState<any[]>([]);
  const [medicineForm, setMedicineForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "daily",
    time: "08:00",
    duration: "",
    instructions: "",
  });
  const [testForm, setTestForm] = useState({
    testName: "",
    testType: "blood_test",
    frequency: "once",
    reason: "",
    instructions: "",
  });

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      // First try to load from localStorage
      const storedRecords = localStorage.getItem("health_records");
      if (storedRecords) {
        try {
          const parsedRecords = JSON.parse(storedRecords);
          setRecords(parsedRecords);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing stored health records:", error);
        }
      }

      // If no stored records, try API (for future backend integration)
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/health-records", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecords(data.data);
        // Save to localStorage for offline access
        localStorage.setItem("health_records", JSON.stringify(data.data));
      } else {
        // If API fails, just set empty array
        console.log("API not available, using local storage only");
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch health records:", error);
      // Fallback to empty array if everything fails
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSampleRecord = async () => {
    // Create a sample record with predefined data
    const sampleRecord = {
      id: Date.now(),
      title: "John Doe",
      record_type: "consultation",
      description: "This is a sample health record for demonstration purposes.",
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

    const updatedRecords = [...records, sampleRecord];
    setRecords(updatedRecords);

    // Save to localStorage so Dashboard can access it
    localStorage.setItem("health_records", JSON.stringify(updatedRecords));

    toast.success("Sample health record added successfully");
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRecordId) {
        // Update existing record
        const updatedRecord = {
          id: editingRecordId,
          title: formData.title,
          record_type: formData.recordType,
          description: formData.description,
          icd11_code: formData.icd11Code,
          icd11_title: formData.icd11Title,
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms
            ? formData.symptoms.split(",").map((s) => s.trim())
            : [],
          namaste_name: formData.namasteName,
          doctor_name: formData.doctorName,
          hospital_name: formData.hospitalName,
          visit_date: formData.visitDate,
          severity: formData.severity,
          verification_status:
            records.find((r) => r.id === editingRecordId)
              ?.verification_status || "pending",
          created_at:
            records.find((r) => r.id === editingRecordId)?.created_at ||
            new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedRecords = records.map((record) =>
          record.id === editingRecordId ? updatedRecord : record
        );
        setRecords(updatedRecords);
        localStorage.setItem("health_records", JSON.stringify(updatedRecords));
        toast.success("Health record updated successfully");
      } else {
        // Create new record
        const newRecord = {
          id: Date.now(),
          title: formData.title,
          record_type: formData.recordType,
          description: formData.description,
          icd11_code: formData.icd11Code,
          icd11_title: formData.icd11Title,
          diagnosis: formData.diagnosis,
          symptoms: formData.symptoms
            ? formData.symptoms.split(",").map((s) => s.trim())
            : [],
          namaste_name: formData.namasteName,
          doctor_name: formData.doctorName,
          hospital_name: formData.hospitalName,
          visit_date: formData.visitDate,
          severity: formData.severity,
          patient_id: formData.patientId,
          verification_status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedRecords = [...records, newRecord];
        setRecords(updatedRecords);
        localStorage.setItem("health_records", JSON.stringify(updatedRecords));

        // Save prescribed medicines to patient reminders
        if (prescribedMedicines.length > 0) {
          const remindersStored = localStorage.getItem("patient_reminders") || "[]";
          const reminders = JSON.parse(remindersStored);
          const newReminders = prescribedMedicines.map((med) => ({
            id: med.id,
            type: "medicine" as const,
            title: med.medicineName,
            description: `Dosage: ${med.dosage}. ${med.instructions}`,
            reminderDate: new Date().toISOString().split("T")[0],
            reminderTime: med.time,
            frequency: med.frequency,
          }));
          const updatedReminders = [...reminders, ...newReminders];
          localStorage.setItem("patient_reminders", JSON.stringify(updatedReminders));
        }

        // Save prescribed tests to patient lab reports
        if (prescribedTests.length > 0) {
          const labReportsStored = localStorage.getItem("patient_lab_reports") || "[]";
          const labReports = JSON.parse(labReportsStored);
          const newLabReports = prescribedTests.map((test) => ({
            id: test.id,
            testName: test.testName,
            date: new Date().toISOString().split("T")[0],
            status: "pending" as const,
            testType: test.testType,
            frequency: test.frequency,
            reason: test.reason,
          }));
          const updatedLabReports = [...labReports, ...newLabReports];
          localStorage.setItem("patient_lab_reports", JSON.stringify(updatedLabReports));
        }

        toast.success("Health record created successfully");
      }

      // Reset form and close dialog
      setIsDialogOpen(false);
      setEditingRecordId(null);
      setFormData({
        recordType: "",
        title: "",
        description: "",
        icd11Code: "",
        icd11Title: "",
        diagnosis: "",
        symptoms: "",
        namasteName: "",
        doctorName: "",
        hospitalName: "",
        visitDate: "",
        severity: "mild",
        patientId: "",
      });
    } catch (error) {
      console.error("Failed to save health record:", error);
      toast.error("Failed to create health record");
    }
  };

  const handleVerifyRecord = async (recordId: number) => {
    try {
      // Update record verification status locally (since API might not exist)
      const updatedRecords = records.map((record) =>
        record.id === recordId
          ? {
              ...record,
              verification_status: "verified",
              updated_at: new Date().toISOString(),
            }
          : record
      );

      setRecords(updatedRecords);

      // Save to localStorage
      localStorage.setItem("health_records", JSON.stringify(updatedRecords));

      toast.success("Record verified successfully");

      // Try API call in background (optional)
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/verification/verify/${recordId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verificationType: "full" }),
        });

        if (response.ok) {
          console.log("Record also verified on server");
        }
      } catch (apiError) {
        console.log("API not available, verified locally only");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Verification failed");
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    try {
      // Remove record from local state
      const updatedRecords = records.filter((record) => record.id !== recordId);
      setRecords(updatedRecords);

      // Update localStorage
      localStorage.setItem("health_records", JSON.stringify(updatedRecords));

      toast.success("Health record deleted successfully");

      // Try API call in background (optional)
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/health-records/${recordId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log("Record also deleted on server");
        }
      } catch (apiError) {
        console.log("API not available, deleted locally only");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete record");
    }
  };

  const handleEditRecord = (record: HealthRecord) => {
    // Set form data with the selected record's data
    setFormData({
      recordType: record.record_type,
      title: record.title,
      description: record.description,
      icd11Code: record.icd11_code || "",
      icd11Title: record.icd11_title || "",
      diagnosis: record.diagnosis || "",
      symptoms: record.symptoms ? record.symptoms.join(", ") : "",
      namasteName: record.namaste_name || "",
      doctorName: record.doctor_name || "",
      hospitalName: record.hospital_name || "",
      visitDate: record.visit_date || "",
      severity: record.severity,
      patientId: record.patient_id || "",
    });

    // Store the record ID for editing
    setEditingRecordId(record.id);

    // Open the dialog
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRecordId(null);
    setFormData({
      recordType: "",
      title: "",
      description: "",
      icd11Code: "",
      icd11Title: "",
      diagnosis: "",
      symptoms: "",
      namasteName: "",
      doctorName: "",
      hospitalName: "",
      visitDate: "",
      severity: "mild",
      patientId: "",
    });
    setPrescribedMedicines([]);
    setPrescribedTests([]);
  };

  const handleAddMedicine = () => {
    if (!medicineForm.medicineName || !medicineForm.dosage) {
      toast.error("Please fill medicine name and dosage");
      return;
    }
    const newMedicine = {
      id: Date.now(),
      ...medicineForm,
    };
    setPrescribedMedicines([...prescribedMedicines, newMedicine]);
    setMedicineForm({
      medicineName: "",
      dosage: "",
      frequency: "daily",
      time: "08:00",
      duration: "",
      instructions: "",
    });
    toast.success("Medicine added to prescription");
  };

  const handleDeleteMedicine = (id: number) => {
    setPrescribedMedicines(prescribedMedicines.filter((m) => m.id !== id));
  };

  const handleAddTest = () => {
    if (!testForm.testName) {
      toast.error("Please fill test name");
      return;
    }
    const newTest = {
      id: Date.now(),
      ...testForm,
    };
    setPrescribedTests([...prescribedTests, newTest]);
    setTestForm({
      testName: "",
      testType: "blood_test",
      frequency: "once",
      reason: "",
      instructions: "",
    });
    toast.success("Test added to prescription");
  };

  const handleDeleteTest = (id: number) => {
    setPrescribedTests(prescribedTests.filter((t) => t.id !== id));
  };

  const handleExportToExcel = () => {
    try {
      if (filteredRecords.length === 0) {
        toast.error("No records to export");
        return;
      }

      // Prepare data for Excel export (use filtered records for current view)
      const exportData = filteredRecords.map((record) => ({
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

      // Generate filename with current date and filter info
      const currentDate = new Date().toISOString().split("T")[0];
      const filterInfo = filterType !== "all" ? `_${filterType}` : "";
      const searchInfo = searchTerm ? `_filtered` : "";
      const filename = `MediBridge_Health_Records${filterInfo}${searchInfo}_${currentDate}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      toast.success(
        `Successfully exported ${filteredRecords.length} records to ${filename}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export records. Please try again.");
    }
  };

  // Removed duplicate handleCreateRecord. Add local record creation logic to main handleCreateRecord.

  // To support local table update, add this inside the main handleCreateRecord after successful API response:
  // setRecords([
  //   ...records,
  //   {
  //     id: Date.now(),
  //     title: formData.title,
  //     record_type: formData.recordType,
  //     description: formData.description,
  //     icd11_code: formData.icd11Code,
  //     icd11_title: formData.icd11Title,
  //     diagnosis: formData.diagnosis,
  //     symptoms: formData.symptoms ? formData.symptoms.split(",").map((s) => s.trim()) : [],
  //     doctor_name: formData.doctorName,
  //     hospital_name: formData.hospitalName,
  //     visit_date: formData.visitDate,
  //     severity: formData.severity,
  //     verification_status: "pending",
  //     created_at: new Date().toISOString(),
  //     updated_at: new Date().toISOString(),
  //   },
  // ]);

  // Removed unreachable/stray code after local setRecords/setFormData logic

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.record_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.namaste_name &&
        record.namaste_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterType === "all" || record.record_type === filterType;

    return matchesSearch && matchesFilter;
  });

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

  const recordTypes = [
    "consultation",
    "lab_result",
    "prescription",
    "imaging",
    "surgery",
    "vaccination",
    "emergency",
    "follow_up",
    "other",
  ];

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
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Logo size="md" showText={true} to="/" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Health Records
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage and organize your medical history
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleCreateSampleRecord}
          >
            <FileText className="h-4 w-4" />
            Add Sample Record
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportToExcel}
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>

          <Button
            className="flex items-center gap-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add New Record
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  {editingRecordId
                    ? "Edit Health Record"
                    : "Create New Health Record"}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Add a new health record to your medical history
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleCreateRecord}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recordType" className="text-sm font-medium">
                      Record Type
                    </Label>
                    <Select
                      value={formData.recordType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, recordType: value })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="severity" className="text-sm font-medium">
                      Severity
                    </Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({ ...formData, severity: value })
                      }
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="severe">Severe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Patient's Name
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter patient's name"
                    className="h-10 sm:h-11"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="patientId" className="text-sm font-medium">
                    Patient ID *
                  </Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    placeholder="Enter patient's ID"
                    className="h-10 sm:h-11"
                    required
                  />
                </div>

                {/* Description field removed as requested */}

                {/* Disease Section */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <DiseaseAutocomplete
                      onDiseaseSelect={(disease) => {
                        setFormData({
                          ...formData,
                          icd11Code: disease.code,
                          icd11Title: disease.title,
                          diagnosis: disease.title,
                          symptoms: disease.symptoms || formData.symptoms,
                        });
                      }}
                      label="Disease/Condition"
                      placeholder="Type disease name or symptoms..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="icd11Code"
                        className="text-sm font-medium"
                      >
                        ICD-11 Code
                      </Label>
                      <Input
                        id="icd11Code"
                        value={formData.icd11Code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            icd11Code: e.target.value,
                          })
                        }
                        placeholder="e.g., BA00"
                        className="h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="icd11Title"
                        className="text-sm font-medium"
                      >
                        ICD-11 Title
                      </Label>
                      <Input
                        id="icd11Title"
                        value={formData.icd11Title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            icd11Title: e.target.value,
                          })
                        }
                        placeholder="ICD-11 condition title"
                        className="h-10 sm:h-11"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="diagnosis" className="text-sm font-medium">
                    Diagnosis
                  </Label>
                  <Textarea
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    placeholder="Medical diagnosis"
                    rows={2}
                    className="min-h-[60px] sm:min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms" className="text-sm font-medium">
                    Symptoms
                  </Label>
                  <Input
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) =>
                      setFormData({ ...formData, symptoms: e.target.value })
                    }
                    placeholder="Comma-separated symptoms"
                    className="h-10 sm:h-11"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctorName" className="text-sm font-medium">
                      Doctor Name
                    </Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) =>
                        setFormData({ ...formData, doctorName: e.target.value })
                      }
                      placeholder="Dr. John Smith"
                      className="h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="hospitalName"
                      className="text-sm font-medium"
                    >
                      Hospital/Clinic
                    </Label>
                    <Input
                      id="hospitalName"
                      value={formData.hospitalName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hospitalName: e.target.value,
                        })
                      }
                      placeholder="General Hospital"
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="visitDate" className="text-sm font-medium">
                    Visit Date
                  </Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={(e) =>
                      setFormData({ ...formData, visitDate: e.target.value })
                    }
                    className="h-10 sm:h-11"
                  />
                </div>

                {/* Medicine Prescription Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <Pill className="h-5 w-5 text-govt-green" />
                      Prescribe Medicine
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm font-medium">Medicine Name</Label>
                      <Input
                        value={medicineForm.medicineName}
                        onChange={(e) =>
                          setMedicineForm({
                            ...medicineForm,
                            medicineName: e.target.value,
                          })
                        }
                        placeholder="e.g., Aspirin"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Dosage</Label>
                      <Input
                        value={medicineForm.dosage}
                        onChange={(e) =>
                          setMedicineForm({
                            ...medicineForm,
                            dosage: e.target.value,
                          })
                        }
                        placeholder="e.g., 500mg"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <div>
                      <Label className="text-sm font-medium">Frequency</Label>
                      <select
                        value={medicineForm.frequency}
                        onChange={(e) =>
                          setMedicineForm({
                            ...medicineForm,
                            frequency: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 border border-input rounded-md text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="twice_daily">Twice Daily</option>
                        <option value="thrice_daily">Thrice Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Time</Label>
                      <Input
                        type="time"
                        value={medicineForm.time}
                        onChange={(e) =>
                          setMedicineForm({
                            ...medicineForm,
                            time: e.target.value,
                          })
                        }
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <Input
                        value={medicineForm.duration}
                        onChange={(e) =>
                          setMedicineForm({
                            ...medicineForm,
                            duration: e.target.value,
                          })
                        }
                        placeholder="e.g., 7 days"
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <Label className="text-sm font-medium">Instructions</Label>
                    <Input
                      value={medicineForm.instructions}
                      onChange={(e) =>
                        setMedicineForm({
                          ...medicineForm,
                          instructions: e.target.value,
                        })
                      }
                      placeholder="e.g., Take after breakfast"
                      className="h-10 text-sm"
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddMedicine}
                    className="w-full bg-govt-green hover:bg-govt-green/90 text-white mb-3"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>

                  {prescribedMedicines.length > 0 && (
                    <div className="space-y-2 mb-3 p-3 bg-green-50 rounded-lg">
                      {prescribedMedicines.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-start justify-between p-2 bg-white rounded border border-green-200"
                        >
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{med.medicineName}</p>
                            <p className="text-xs text-gray-600">
                              {med.dosage} • {med.frequency} • {med.time}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Test Prescription Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <Microscope className="h-5 w-5 text-govt-blue" />
                      Prescribe Tests
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label className="text-sm font-medium">Test Name</Label>
                      <Input
                        value={testForm.testName}
                        onChange={(e) =>
                          setTestForm({
                            ...testForm,
                            testName: e.target.value,
                          })
                        }
                        placeholder="e.g., Blood Test"
                        className="h-10 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Test Type</Label>
                      <select
                        value={testForm.testType}
                        onChange={(e) =>
                          setTestForm({
                            ...testForm,
                            testType: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 border border-input rounded-md text-sm"
                      >
                        <option value="blood_test">Blood Test</option>
                        <option value="urine_test">Urine Test</option>
                        <option value="xray">X-Ray</option>
                        <option value="ultrasound">Ultrasound</option>
                        <option value="ct_scan">CT Scan</option>
                        <option value="mri">MRI</option>
                        <option value="ecg">ECG</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Frequency</Label>
                    <select
                      value={testForm.frequency}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          frequency: e.target.value,
                        })
                      }
                      className="w-full h-10 px-3 border border-input rounded-md text-sm mb-3"
                    >
                      <option value="once">Once (One time only)</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Every 3 Months</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <Label className="text-sm font-medium">Reason/Instructions</Label>
                    <Textarea
                      value={testForm.reason}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          reason: e.target.value,
                        })
                      }
                      placeholder="e.g., Follow-up for diabetes screening"
                      rows={2}
                      className="text-sm resize-none min-h-[60px]"
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddTest}
                    className="w-full bg-govt-blue hover:bg-govt-blue/90 text-white mb-3"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Test
                  </Button>

                  {prescribedTests.length > 0 && (
                    <div className="space-y-2 mb-3 p-3 bg-blue-50 rounded-lg">
                      {prescribedTests.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-start justify-between p-2 bg-white rounded border border-blue-200"
                        >
                          <div className="flex-1 text-sm">
                            <p className="font-medium">{test.testName}</p>
                            <p className="text-xs text-gray-600">
                              {test.testType} • {test.frequency}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteTest(test.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
                  >
                    {editingRecordId ? "Update Record" : "Create Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search health records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 sm:h-11"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {recordTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">
                    {record.title}
                  </CardTitle>
                  <CardDescription className="capitalize text-sm">
                    {record.record_type.replace("_", " ")}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-8 w-8 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEditRecord(record)}
                      className="flex items-center gap-2 text-blue-600 focus:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Record
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="flex items-center gap-2 text-red-600 focus:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Record
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Health Record
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{record.title}"?
                            This action cannot be undone and will permanently
                            remove this health record from your account.
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
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
                  {record.description}
                </p>

                {record.icd11_code && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="font-medium truncate">
                      {record.icd11_code}
                    </span>
                    <span className="text-gray-600 truncate">
                      {record.icd11_title}
                    </span>
                  </div>
                )}

                {record.namaste_name && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-gray-400 shrink-0">🏥</span>
                    <span className="font-medium text-blue-600 truncate">
                      {record.namaste_name}
                    </span>
                  </div>
                )}

                {record.doctor_name && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{record.doctor_name}</span>
                  </div>
                )}

                {record.hospital_name && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">{record.hospital_name}</span>
                  </div>
                )}

                {record.visit_date && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {new Date(record.visit_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                  <div className="flex gap-1 sm:gap-2 flex-wrap">
                    <Badge
                      className={`text-xs ${getSeverityColor(record.severity)}`}
                    >
                      {record.severity}
                    </Badge>
                    <Badge
                      className={`text-xs ${getStatusColor(
                        record.verification_status
                      )}`}
                    >
                      {record.verification_status}
                    </Badge>
                  </div>

                  {record.verification_status !== "verified" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyRecord(record.id)}
                      className="flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8 shrink-0"
                    >
                      <Shield className="h-3 w-3" />
                      <span className="hidden sm:inline">Verify</span>
                      <span className="sm:hidden">✓</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== "all"
              ? "No matching records"
              : "No health records yet"}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 max-w-md mx-auto leading-relaxed">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start by adding your first health record"}
          </p>
          {!searchTerm && filterType === "all" && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="text-sm sm:text-base h-10 sm:h-11 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Record
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthRecords;
