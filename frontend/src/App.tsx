import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/DoctorsDashboard";
import PatientsDashboard from "./pages/PatientsDashboard";
import HealthRecords from "./pages/HealthRecords";
import DoctorProfileSetup from "./pages/DoctorProfileSetup";
import NotFound from "./pages/NotFound";
import PatientIdSetup from "./pages/PatientIdSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patient-dashboard" element={<PatientsDashboard />} />
          <Route path="/health-records" element={<HealthRecords />} />
          <Route path="/doctor-profile-setup" element={<DoctorProfileSetup />} />
          <Route path="/patient-id-setup" element={<PatientIdSetup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
