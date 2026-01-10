import { useNavigate } from "react-router-dom";
import PatientIdSetup from "@/components/PatientIdSetup";
import { useEffect, useState } from "react";

const PatientIdSetupPage = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email || "");
        setUserName(user.name || "Patient");
      } catch {}
    }
  }, []);

  const handleSubmit = (patientId: string) => {
    localStorage.setItem("patient_id", patientId);
    navigate("/patient-dashboard");
  };

  return (
    <PatientIdSetup onSubmit={handleSubmit} userEmail={userEmail} userName={userName} />
  );
};

export default PatientIdSetupPage;