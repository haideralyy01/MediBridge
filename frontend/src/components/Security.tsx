import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Server, Award, CheckCircle } from "lucide-react";

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "256-bit Encryption",
      description:
        "Military-grade encryption protects your documents both in storage and transmission.",
    },
    {
      icon: Shield,
      title: "Digital Signatures",
      description:
        "All documents are digitally signed and verified using government-approved certificates.",
    },
    {
      icon: Eye,
      title: "Access Control",
      description:
        "You control who can view your documents with granular permission settings.",
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description:
        "Hosted on government-approved cloud infrastructure with 99.9% uptime.",
    },
    {
      icon: Award,
      title: "Compliance Certified",
      description:
        "Compliant with Data Protection Act, HIPAA, and international healthcare standards.",
    },
    {
      icon: CheckCircle,
      title: "Audit Trail",
      description:
        "Complete audit trail of who accessed your documents and when.",
    },
  ];

  return (
    <section id="verify" className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Security & Verification
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Your health documents are protected with government-grade security
            measures and verified using advanced authentication technologies.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Security Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="bg-card border border-border">
                <CardHeader className="pb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded bg-secondary flex items-center justify-center mb-2">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-govt-blue" />
                  </div>
                  <CardTitle className="text-sm sm:text-base text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Verification Process */}
          <div className="space-y-4 sm:space-y-6 mt-8 lg:mt-0">
            <Card className="bg-secondary/50 border-2 border-govt-blue/20">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-govt-blue text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        Document Upload
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Upload your health document securely
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-govt-blue text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        {/* Namaste TM2 Verification removed */}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Advanced verification checks document authenticity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-govt-green text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        ICD-11 Classification
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Document is classified and organized automatically
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-govt-green text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-1">
                      4
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">
                        Secure Storage
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Document stored in your encrypted digital vault
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-govt-blue/5 p-4 sm:p-6 rounded border border-govt-blue/20">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Why Verification Matters
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
                Document verification ensures that your health records are
                genuine, tamper-proof, and legally acceptable for insurance
                claims, medical consultations, and official procedures.
              </p>
              <Button
                variant="govt-outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                Learn More About Verification
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
