import { Button } from "@/components/ui/button";
import { FolderOpen, Shield, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Navigation = () => {
  // Smooth scroll handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="w-full bg-card border-b-2 border-govt-blue sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Government Style Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-[var(--folder-gradient)] rounded">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="text-lg sm:text-xl font-bold text-govt-blue">
                  MediBridge
                </div>
                <div className="text-xs text-muted-foreground">
                  Digital Health Documents
                </div>
              </div>
              <div className="block sm:hidden">
                <div className="text-base font-bold text-govt-blue">
                  MediBridge
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="#services"
              onClick={handleNavClick}
              className="text-sm font-medium text-muted-foreground hover:text-govt-blue transition-colors"
            >
              Services
            </a>
            <a
              href="#documents"
              onClick={handleNavClick}
              className="text-sm font-medium text-muted-foreground hover:text-govt-blue transition-colors"
            >
              Documents
            </a>
            <a
              href="#verify"
              onClick={handleNavClick}
              className="text-sm font-medium text-muted-foreground hover:text-govt-blue transition-colors"
            >
              Verify
            </a>
            <a
              href="#help"
              onClick={handleNavClick}
              className="text-sm font-medium text-muted-foreground hover:text-govt-blue transition-colors"
            >
              Help
            </a>
          </div>

          {/* Login Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link to="/login" className="hidden sm:block">
              <Button
                variant="govt"
                size="sm"
                className="text-xs sm:text-sm bg-gradient-to-r from-govt-blue to-govt-green hover:from-govt-blue/90 hover:to-govt-green/90"
              >
                Get Started
              </Button>
            </Link>
            <Link to="/login" className="block sm:hidden">
              <Button 
                variant="govt" 
                size="sm" 
                className="text-xs px-2 bg-gradient-to-r from-govt-blue to-govt-green hover:from-govt-blue/90 hover:to-govt-green/90"
              >
                Start
              </Button>
            </Link>
            <div className="lg:hidden">
              <Menu className="h-5 w-5 text-govt-blue" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
