import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, IdCard } from "lucide-react";

interface PatientIdSetupProps {
  onSubmit: (patientId: string) => void;
  userEmail: string;
  userName: string;
}

const PatientIdSetup = ({ onSubmit, userEmail, userName }: PatientIdSetupProps) => {
  const [patientId, setPatientId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId.trim()) {
      toast.error("Please enter your Patient ID");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(patientId.trim());
      toast.success("Patient ID linked successfully!");
    } catch (error) {
      console.error("Error linking patient ID:", error);
      toast.error("Failed to link Patient ID. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <User className="h-8 w-8 text-govt-blue" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-govt-blue to-govt-green bg-clip-text text-transparent">
              Link Your Patient ID
            </h1>
          </div>
          <p className="text-muted-foreground">
            Welcome, {userName}! Please enter your Patient ID to access your medical records.
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <IdCard className="h-5 w-5 text-govt-blue" />
              <span>Patient Identification</span>
            </CardTitle>
            <CardDescription>
              Enter the Patient ID provided by your healthcare provider.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID *</Label>
                <Input
                  id="patientId"
                  placeholder="e.g., PAT-001, P12345"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  This ID was assigned to you by your doctor or hospital.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-govt-blue to-govt-green hover:from-govt-blue/90 hover:to-govt-green/90 text-white font-semibold py-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Linking Patient ID...
                  </>
                ) : (
                  <>
                    <IdCard className="h-4 w-4 mr-2" />
                    Link Patient ID
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Don't have a Patient ID? Contact your healthcare provider.</p>
          <p className="mt-1">Logged in as: {userEmail}</p>
        </div>
      </div>
    </div>
  );
};

export default PatientIdSetup;