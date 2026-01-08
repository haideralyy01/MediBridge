import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  FileText,
  Plus,
  Pill,
  Calendar,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit,
  LogOut,
  Home,
} from "lucide-react";
import { toast } from "sonner";

interface DiagnosedRecord {
  id: number;
  title: string;
  diagnosis: string;
  icd11Code?: string;
  doctorName: string;
  hospitalName: string;
  visitDate: string;
  severity: string;
}

interface Suggestion {
  id: number;
  type: "do" | "dont";
  title: string;
  description: string;
  category: string;
}

interface LabReport {
  id: number;
  testName: string;
  date: string;
  fileUrl?: string;
  status: "pending" | "completed";
}

interface Reminder {
  id: number;
  type: "checkup" | "medicine";
  title: string;
  description: string;
  reminderDate: string;
  reminderTime: string;
  frequency: "once" | "daily" | "weekly" | "monthly";
}

const PatientsDashboard = () => {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [diagnoses, setDiagnoses] = useState<DiagnosedRecord[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isLabReportDialogOpen, setIsLabReportDialogOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<number | null>(null);

  // Form data
  const [reminderForm, setReminderForm] = useState({
    type: "checkup" as "checkup" | "medicine",
    title: "",
    description: "",
    reminderDate: "",
    reminderTime: "",
    frequency: "once" as "once" | "daily" | "weekly" | "monthly",
  });

  const [labReportForm, setLabReportForm] = useState({
    testName: "",
    date: "",
    status: "pending" as "pending" | "completed",
  });

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      // Get patient info from localStorage
      const userData = localStorage.getItem("user_data");
      const patientIdStored = localStorage.getItem("patient_id");

      if (userData) {
        const user = JSON.parse(userData);
        setPatientName(user.name || "Patient");
      }

      if (patientIdStored) {
        setPatientId(patientIdStored);
      }

      // Load health records for this patient
      const healthRecordsStored = localStorage.getItem("health_records");
      if (healthRecordsStored) {
        const records = JSON.parse(healthRecordsStored);
        // Filter records by patient ID and convert to diagnosed records format
        const diagnosedRecords = records
          .filter((record: any) => record.patient_id === patientIdStored)
          .map((record: any) => ({
            id: record.id,
            title: record.title,
            diagnosis: record.diagnosis || "N/A",
            icd11Code: record.icd11_code,
            doctorName: record.doctor_name || "Unknown",
            hospitalName: record.hospital_name || "Unknown",
            visitDate: record.visit_date || new Date().toISOString().split("T")[0],
            severity: record.severity || "mild",
          }));
        setDiagnoses(diagnosedRecords);

        // Load or create suggestions based on diagnoses
        loadSuggestions(diagnosedRecords);
      }

      // Load stored reminders
      const remindersStored = localStorage.getItem("patient_reminders");
      if (remindersStored) {
        setReminders(JSON.parse(remindersStored));
      }

      // Load stored lab reports
      const labReportsStored = localStorage.getItem("patient_lab_reports");
      if (labReportsStored) {
        setLabReports(JSON.parse(labReportsStored));
      }
    } catch (error) {
      console.error("Failed to load patient data:", error);
      toast.error("Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = (diagnoses: DiagnosedRecord[]) => {
    const defaultSuggestions: Suggestion[] = [
      {
        id: 1,
        type: "do",
        title: "Stay Hydrated",
        description: "Drink at least 8-10 glasses of water daily",
        category: "General Health",
      },
      {
        id: 2,
        type: "do",
        title: "Exercise Regularly",
        description: "Engage in 30 minutes of moderate exercise daily",
        category: "Fitness",
      },
      {
        id: 3,
        type: "dont",
        title: "Avoid Stress",
        description: "Practice stress management techniques like meditation or yoga",
        category: "Mental Health",
      },
      {
        id: 4,
        type: "dont",
        title: "Limit Junk Food",
        description: "Reduce intake of processed and fried foods",
        category: "Nutrition",
      },
    ];

    setSuggestions(defaultSuggestions);
  };

  const handleAddReminder = async () => {
    if (
      !reminderForm.title ||
      !reminderForm.reminderDate ||
      !reminderForm.reminderTime
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingReminderId) {
        // Update reminder
        const updatedReminders = reminders.map((r) =>
          r.id === editingReminderId
            ? { ...r, ...reminderForm }
            : r
        );
        setReminders(updatedReminders);
        localStorage.setItem("patient_reminders", JSON.stringify(updatedReminders));
        toast.success("Reminder updated successfully");
        setEditingReminderId(null);
      } else {
        // Add new reminder
        const newReminder: Reminder = {
          id: Date.now(),
          ...reminderForm,
        };
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        localStorage.setItem("patient_reminders", JSON.stringify(updatedReminders));
        toast.success("Reminder added successfully");
      }

      // Reset form
      setReminderForm({
        type: "checkup",
        title: "",
        description: "",
        reminderDate: "",
        reminderTime: "",
        frequency: "once",
      });
      setIsReminderDialogOpen(false);
    } catch (error) {
      console.error("Failed to add reminder:", error);
      toast.error("Failed to add reminder");
    }
  };

  const handleDeleteReminder = (reminderId: number) => {
    try {
      const updatedReminders = reminders.filter((r) => r.id !== reminderId);
      setReminders(updatedReminders);
      localStorage.setItem("patient_reminders", JSON.stringify(updatedReminders));
      toast.success("Reminder deleted successfully");
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const handleAddLabReport = async () => {
    if (!labReportForm.testName || !labReportForm.date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const newReport: LabReport = {
        id: Date.now(),
        ...labReportForm,
      };
      const updatedReports = [...labReports, newReport];
      setLabReports(updatedReports);
      localStorage.setItem("patient_lab_reports", JSON.stringify(updatedReports));
      toast.success("Lab report added successfully");

      // Reset form
      setLabReportForm({
        testName: "",
        date: "",
        status: "pending",
      });
      setIsLabReportDialogOpen(false);
    } catch (error) {
      console.error("Failed to add lab report:", error);
      toast.error("Failed to add lab report");
    }
  };

  const handleDeleteLabReport = (reportId: number) => {
    try {
      const updatedReports = labReports.filter((r) => r.id !== reportId);
      setLabReports(updatedReports);
      localStorage.setItem("patient_lab_reports", JSON.stringify(updatedReports));
      toast.success("Lab report deleted");
    } catch (error) {
      console.error("Failed to delete lab report:", error);
      toast.error("Failed to delete lab report");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("patient_id");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-secondary/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-govt-green mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo size="sm" showText={false} to="/" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-govt-green">
                Patient Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                ID: {patientId}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {patientName}
            </span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Diagnosed Records Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              📋 Your Diagnoses
            </h2>
            <p className="text-sm text-muted-foreground">
              Health records added by your doctors
            </p>
          </div>
          {diagnoses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {diagnoses.map((diagnosis) => (
                <Card key={diagnosis.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{diagnosis.title}</CardTitle>
                        <CardDescription>{diagnosis.diagnosis}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          diagnosis.severity === "severe"
                            ? "destructive"
                            : diagnosis.severity === "moderate"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {diagnosis.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Doctor:</span>{" "}
                      {diagnosis.doctorName}
                    </div>
                    <div>
                      <span className="font-medium">Hospital:</span>{" "}
                      {diagnosis.hospitalName}
                    </div>
                    <div>
                      <span className="font-medium">Visit Date:</span>{" "}
                      {diagnosis.visitDate}
                    </div>
                    {diagnosis.icd11Code && (
                      <div>
                        <span className="font-medium">ICD-11 Code:</span>{" "}
                        {diagnosis.icd11Code}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-secondary/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No diagnoses yet. Once your doctor adds records, they will appear here.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Suggestions Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              💡 Health Suggestions
            </h2>
            <p className="text-sm text-muted-foreground">
              Personalized recommendations for better health
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className={`${
                    suggestion.type === "do"
                      ? "border-govt-green/50 bg-govt-green/5"
                      : "border-destructive/50 bg-destructive/5"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      {suggestion.type === "do" ? (
                        <CheckCircle className="w-5 h-5 text-govt-green flex-shrink-0 mt-1" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {suggestion.category}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">
                      {suggestion.description}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No suggestions available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Lab Reports Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🔬 Lab Reports
              </h2>
              <p className="text-sm text-muted-foreground">
                Track your test results
              </p>
            </div>
            <Dialog open={isLabReportDialogOpen} onOpenChange={setIsLabReportDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-govt-blue hover:bg-govt-blue/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Lab Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Lab Report</DialogTitle>
                  <DialogDescription>
                    Add a new lab report or test result
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Test Name *</Label>
                    <Input
                      id="test-name"
                      placeholder="e.g., Blood Test, X-Ray"
                      value={labReportForm.testName}
                      onChange={(e) =>
                        setLabReportForm({
                          ...labReportForm,
                          testName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-date">Date *</Label>
                    <Input
                      id="test-date"
                      type="date"
                      value={labReportForm.date}
                      onChange={(e) =>
                        setLabReportForm({
                          ...labReportForm,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-status">Status</Label>
                    <select
                      id="test-status"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={labReportForm.status}
                      onChange={(e) =>
                        setLabReportForm({
                          ...labReportForm,
                          status: e.target.value as "pending" | "completed",
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <Button onClick={handleAddLabReport} className="w-full">
                    Add Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {labReports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {labReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.testName}</CardTitle>
                        <CardDescription>{report.date}</CardDescription>
                      </div>
                      <Badge
                        variant={report.status === "completed" ? "default" : "secondary"}
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleDeleteLabReport(report.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-secondary/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No lab reports yet. Add your first test result above.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Checkup/Test Reminders Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                📅 Checkup/Test Reminders
              </h2>
              <p className="text-sm text-muted-foreground">
                Never miss an important appointment
              </p>
            </div>
            <Dialog open={isReminderDialogOpen && !editingReminderId} onOpenChange={setIsReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-govt-green hover:bg-govt-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Checkup Reminder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Checkup/Test Reminder</DialogTitle>
                  <DialogDescription>
                    Set a reminder for your upcoming checkup or test
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reminder-title">Title *</Label>
                    <Input
                      id="reminder-title"
                      placeholder="e.g., Annual Physical Checkup"
                      value={reminderForm.title}
                      onChange={(e) =>
                        setReminderForm({
                          ...reminderForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-description">Description</Label>
                    <Textarea
                      id="reminder-description"
                      placeholder="Add any notes..."
                      value={reminderForm.description}
                      onChange={(e) =>
                        setReminderForm({
                          ...reminderForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-date">Date *</Label>
                      <Input
                        id="reminder-date"
                        type="date"
                        value={reminderForm.reminderDate}
                        onChange={(e) =>
                          setReminderForm({
                            ...reminderForm,
                            reminderDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-time">Time *</Label>
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderForm.reminderTime}
                        onChange={(e) =>
                          setReminderForm({
                            ...reminderForm,
                            reminderTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-frequency">Frequency</Label>
                    <select
                      id="reminder-frequency"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={reminderForm.frequency}
                      onChange={(e) =>
                        setReminderForm({
                          ...reminderForm,
                          frequency: e.target.value as any,
                        })
                      }
                    >
                      <option value="once">Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <Button onClick={handleAddReminder} className="w-full">
                    Add Reminder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {reminders.filter((r) => r.type === "checkup").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {reminders
                .filter((r) => r.type === "checkup")
                .map((reminder) => (
                  <Card key={reminder.id} className="border-govt-blue/30 bg-govt-blue/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{reminder.title}</CardTitle>
                      <CardDescription>
                        {reminder.reminderDate} at {reminder.reminderTime}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {reminder.description && (
                        <p className="text-sm text-foreground">
                          {reminder.description}
                        </p>
                      )}
                      <Badge variant="outline">{reminder.frequency}</Badge>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="bg-secondary/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No checkup reminders set. Add one to stay on track.</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Medicine Reminders Section */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                💊 Medicine Reminders
              </h2>
              <p className="text-sm text-muted-foreground">
                Take your medicines on time
              </p>
            </div>
            <Dialog open={isReminderDialogOpen && editingReminderId === null} onOpenChange={setIsReminderDialogOpen}>
              <DialogTrigger asChild onClick={() => setReminderForm({ ...reminderForm, type: "medicine" })}>
                <Button className="bg-govt-green hover:bg-govt-green/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medicine Reminder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Medicine Reminder</DialogTitle>
                  <DialogDescription>
                    Never forget your medication schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-title">Medicine Name *</Label>
                    <Input
                      id="med-title"
                      placeholder="e.g., Aspirin 500mg"
                      value={reminderForm.title}
                      onChange={(e) =>
                        setReminderForm({
                          ...reminderForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-description">Dosage & Instructions</Label>
                    <Textarea
                      id="med-description"
                      placeholder="e.g., 1 tablet after breakfast"
                      value={reminderForm.description}
                      onChange={(e) =>
                        setReminderForm({
                          ...reminderForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="med-date">Start Date *</Label>
                      <Input
                        id="med-date"
                        type="date"
                        value={reminderForm.reminderDate}
                        onChange={(e) =>
                          setReminderForm({
                            ...reminderForm,
                            reminderDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="med-time">Time *</Label>
                      <Input
                        id="med-time"
                        type="time"
                        value={reminderForm.reminderTime}
                        onChange={(e) =>
                          setReminderForm({
                            ...reminderForm,
                            reminderTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-frequency">Frequency *</Label>
                    <select
                      id="med-frequency"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={reminderForm.frequency}
                      onChange={(e) =>
                        setReminderForm({
                          ...reminderForm,
                          frequency: e.target.value as any,
                        })
                      }
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <Button onClick={handleAddReminder} className="w-full">
                    Add Reminder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {reminders.filter((r) => r.type === "medicine").length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {reminders
                .filter((r) => r.type === "medicine")
                .map((reminder) => (
                  <Card key={reminder.id} className="border-govt-green/30 bg-govt-green/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Pill className="w-5 h-5 text-govt-green" />
                        <span>{reminder.title}</span>
                      </CardTitle>
                      <CardDescription>
                        {reminder.reminderDate} at {reminder.reminderTime}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {reminder.description && (
                        <p className="text-sm text-foreground">
                          {reminder.description}
                        </p>
                      )}
                      <Badge variant="outline">{reminder.frequency}</Badge>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="bg-secondary/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Pill className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No medicine reminders set. Add your medications above.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default PatientsDashboard;
