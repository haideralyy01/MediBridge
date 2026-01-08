import { Button } from "@/components/ui/button";
import { Shield, FileText, Folder, Check } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-background">
      {/* Government Banner */}
      <div className="bg-[var(--govt-gradient)] py-2 sm:py-3">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center text-white text-xs sm:text-sm text-center">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">
              Government of India Initiative | Secure • Authentic • Accessible
            </span>
            <span className="sm:hidden">Digital India Initiative</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8 sm:space-y-10 order-2 lg:order-1">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center bg-secondary text-govt-blue px-3 sm:px-4 py-2 rounded border border-govt-blue/20 text-xs sm:text-sm">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Digital India Health Initiative
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
                Your health records.
                <span className="text-govt-blue block sm:inline">
                  {" "}
                  Your guidance. One bridge.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                MediBridge helps you store medical records digitally, understand symptoms,
                and manage medicines and checkups—all in one secure platform.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-govt-green flex items-center justify-center flex-shrink-0">
                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-foreground">
                  Secure Cloud Storage
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-govt-green flex items-center justify-center flex-shrink-0">
                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-foreground">
                  Document Verification
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-govt-green flex items-center justify-center flex-shrink-0">
                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-foreground">
                  Instant Sharing
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-govt-green flex items-center justify-center flex-shrink-0">
                  <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
                <span className="text-xs sm:text-sm text-foreground">
                  Mobile Access
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-2">
              <Button
                variant="govt"
                size="lg"
                className="font-medium text-sm sm:text-base w-full sm:w-auto px-8 py-3"
              >
                Create Your Health Vault
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 border-t border-border/30">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-govt-green" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  SSL Secured
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-govt-blue" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  ISO 27001
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-govt-orange" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  HIPAA Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Logo Display */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
              <img
                src="/1757848899458.png"
                alt="MediBridge Logo"
                className="w-full h-auto object-contain rounded-lg shadow-[var(--shadow-document)] 
                           transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
