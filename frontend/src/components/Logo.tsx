import { Link } from "react-router-dom";
import { FolderOpen } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  to?: string;
}

const Logo = ({
  size = "md",
  showText = true,
  className = "",
  to = "/",
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} bg-[var(--folder-gradient)] rounded flex items-center justify-center`}>
      <FolderOpen className={`${sizeClasses[size]} text-white`} />
    </div>
  );

  const LogoContent = () => (
    <div className={`flex items-center gap-2 sm:gap-3 group ${className}`}>
      <LogoIcon />
      {showText && (
        <div>
          <div
            className={`${textSizeClasses[size]} font-bold text-blue-700 group-hover:text-blue-600 transition-colors duration-200`}
          >
            MediBridge
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
            Dual coding for Digital India
          </div>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
