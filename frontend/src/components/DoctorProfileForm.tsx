import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Stethoscope, MapPin, Phone, Globe, FileText, Plus, X } from "lucide-react";

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

interface DoctorProfileFormProps {
  onSubmit: (data: DoctorProfileData) => void;
  onSkip?: () => void;
  userEmail: string;
  userName?: string;
  initialData?: DoctorProfileData;
  isEditing?: boolean;
}

const DoctorProfileForm = ({ onSubmit, onSkip, userEmail, userName, initialData, isEditing = false }: DoctorProfileFormProps) => {
  const [formData, setFormData] = useState<DoctorProfileData>({
    name: userName || "",
    licenseNumber: "",
    specialties: [],
    address: "",
    phone: "",
    website: "",
    description: "",
    hospital: "",
    yearsOfExperience: 0,
  });

  // Keep form in sync when an existing profile is fetched asynchronously
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || userName || "",
        licenseNumber: initialData.licenseNumber || "",
        specialties: initialData.specialties || [],
        address: initialData.address || "",
        phone: initialData.phone || "",
        website: initialData.website || "",
        description: initialData.description || "",
        hospital: initialData.hospital || "",
        yearsOfExperience: initialData.yearsOfExperience ?? 0,
      });
    } else if (userName) {
      // If no initialData but we have a userName, ensure name is prefilled
      setFormData((prev) => ({ ...prev, name: prev.name || userName }));
    }
  }, [initialData, userName]);

  const [newSpecialty, setNewSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonSpecialties = [
    "General Medicine", "Cardiology", "Dermatology", "Endocrinology",
    "Gastroenterology", "Neurology", "Oncology", "Orthopedics",
    "Pediatrics", "Psychiatry", "Radiology", "Surgery"
  ];

  const handleInputChange = (field: keyof DoctorProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpecialty = (specialty: string) => {
    if (specialty.trim() && !formData.specialties.includes(specialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty.trim()]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.licenseNumber.trim()) {
      toast.error("Please enter your medical license number");
      return;
    }

    if (formData.specialties.length === 0) {
      toast.error("Please add at least one specialty");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit(formData);
      toast.success("Doctor profile created successfully!");
    } catch (error) {
      console.error("Error submitting doctor profile:", error);
      toast.error("Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Stethoscope className="h-8 w-8 text-govt-blue" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-govt-blue to-govt-green bg-clip-text text-transparent">
              {isEditing ? "Edit Your Doctor Profile" : "Complete Your Doctor Profile"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Update your professional information."
              : "Please complete your professional profile to get started."
            }
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-govt-blue" />
              <span>Professional Information</span>
            </CardTitle>
            <CardDescription>
              This information will be used to verify your credentials and help patients find you.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Dr. John Smith"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license">Medical License Number *</Label>
                  <Input
                    id="license"
                    placeholder="MD123456"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital/Clinic</Label>
                  <Input
                    id="hospital"
                    placeholder="City General Hospital"
                    value={formData.hospital || ""}
                    onChange={(e) => handleInputChange("hospital", e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="5"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience || ""}
                    onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Medical Specialties *</Label>
                
                {formData.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="secondary"
                        className="flex items-center space-x-1 bg-govt-blue/10 text-govt-blue hover:bg-govt-blue/20"
                      >
                        <span>{specialty}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a specialty..."
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialty(newSpecialty);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSpecialty(newSpecialty)}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Or choose from common specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonSpecialties
                      .filter(specialty => !formData.specialties.includes(specialty))
                      .slice(0, 8)
                      .map((specialty) => (
                        <Button
                          key={specialty}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSpecialty(specialty)}
                          className="text-xs hover:bg-govt-blue/10 hover:text-govt-blue hover:border-govt-blue/30"
                        >
                          + {specialty}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-govt-green" />
                  <span>Contact Information</span>
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Practice Address</Label>
                  <Textarea
                    id="address"
                    placeholder="123 Medical Center Dr, City, State, ZIP"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="https://www.yourpractice.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">About Your Practice (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your practice, experience, and approach to patient care..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-govt-blue to-govt-green hover:from-govt-blue/90 hover:to-govt-green/90 text-white font-semibold py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditing ? "Updating Profile..." : "Creating Profile..."}
                    </>
                  ) : (
                    <>
                      <Stethoscope className="h-4 w-4 mr-2" />
                      {isEditing ? "Update Profile" : "Complete Profile"}
                    </>
                  )}
                </Button>
                
                {onSkip && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSkip}
                    className="sm:w-auto"
                  >
                    Skip for Now
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Your information is secure and will only be used for professional verification.</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileForm;