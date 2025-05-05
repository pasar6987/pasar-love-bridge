
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/useLanguage";

interface LanguageToggleProps {
  variant?: "icon" | "text" | "full";
  size?: "sm" | "md" | "lg";
}

export function LanguageToggle({ 
  variant = "icon", 
  size = "md" 
}: LanguageToggleProps) {
  const { language, setLanguage, t } = useLanguage();
  
  const buttonSizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10"
  };
  
  const getButtonVariant = () => {
    switch (variant) {
      case "icon":
        return "ghost";
      case "text":
        return "ghost";
      case "full":
        return "outline";
      default:
        return "ghost";
    }
  };
  
  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'ja' : 'ko');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={getButtonVariant()}
          size={variant === "icon" ? "icon" : "default"}
          className={variant === "icon" ? `rounded-full ${buttonSizeClasses[size]}` : ""}
        >
          <Globe className={variant === "icon" ? "h-[1.2em] w-[1.2em]" : "h-4 w-4 mr-2"} />
          {variant !== "icon" && (
            <span>
              {language === "ko" ? "한국어" : "日本語"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("ko")}>
          🇰🇷 한국어
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("ja")}>
          🇯🇵 日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
