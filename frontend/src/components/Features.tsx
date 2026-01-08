import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderOpen,
  Shield,
  FileText,
  Upload,
  Download,
  Share2,
  Smartphone,
  Search,
  Pill,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: FolderOpen,
      title: "🗂️ Digital Health Records",
      description:
        "Securely store and access medical reports, prescriptions, and health documents anytime, anywhere—no more carrying physical files.",
      color: "text-govt-green",
    },
    {
      icon: Shield,
      title: "🔐 Verify Authenticity",
      description:
        "Advanced verification using ICD-11 (TM2) technology ensures your documents are genuine and tamper-proof.",
      color: "text-govt-blue",
    },
    {
      icon: AlertCircle,
      title: "📋 What to Do & What Not to Do",
      description:
        "Get simple, actionable advice on preventive care and things to avoid, based on your symptoms and health condition.",
      color: "text-govt-green",
    },
    {
      icon: Sparkles,
      title: "🌱 Built for the Future",
      description:
        "Designed to integrate with hospitals, labs, and advanced health analytics in future versions.",
      color: "text-govt-blue",
    },
    {
      icon: Share2,
      title: "Secure Sharing",
      description:
        "Share verified copies with doctors, hospitals, or insurance companies with just a few clicks.",
      color: "text-govt-green",
    },
    {
      icon: FileText,
      title: "🧾 ICD-11 (TM2) Classification",
      description:
        "Documents are automatically classified using WHO's latest International Classification of Diseases.",
      color: "text-govt-green",
    },
    {
      icon: Pill,
      title: "💊 Medicine Reminders",
      description:
        "Never miss a dose. Set reminders for medicines based on prescriptions and schedules.",
      color: "text-govt-blue",
    },
    {
      icon: Smartphone,
      title: "🏥 Checkup & Test Reminders",
      description:
        "Get timely reminders for doctor visits, follow-up tests, and disease-based health checkups.",
      color: "text-govt-green",
    },
  ];

  return (
    <section id="services" className="py-12 sm:py-16 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
            Services & Features
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            A comprehensive digital platform for managing your health documents
            with government-grade security and international standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border border-border hover:shadow-[var(--shadow-document)] transition-all duration-200 h-full"
            >
              <CardHeader className="text-center pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-secondary mx-auto flex items-center justify-center mb-2 sm:mb-3">
                  <feature.icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`}
                  />
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Document Types Section */}
        <div id="documents" className="mt-12 sm:mt-16">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
              Supported Document Types
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
              Store and manage all types of health-related documents
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[
              "Lab Reports & Test Results",
              "Vaccination Certificates",
              "Prescriptions & Medicine Lists",
              "Medical Imaging (X-Ray, MRI, CT Scan)",
              "Discharge Summaries",
              "Insurance Documents",
              "Medical Certificates",
              "Health Check-up Reports",
            ].map((docType, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 bg-card border border-border rounded hover:shadow-sm transition-shadow"
              >
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-govt-blue flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-foreground leading-tight">
                  {docType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
