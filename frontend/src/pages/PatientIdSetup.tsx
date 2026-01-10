import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const PatientIdSetup = () => {
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setError("Patient ID is required.");
      return;
    }
    localStorage.setItem("patient_id", patientId.trim());
    // Optionally, also update sessionStorage for consistency
    sessionStorage.setItem("patient_id", patientId.trim());
    navigate("/patient-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/30 via-background to-secondary/20">
      <Card className="w-full max-w-md mx-auto animate-in fade-in duration-500">
        <CardHeader>
          <CardTitle>Enter Your Patient ID</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                type="text"
                placeholder="Enter your Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full"
              />
              {error && <p className="text-destructive text-xs mt-2">{error}</p>}
            </div>
            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientIdSetup;
