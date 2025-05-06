
import { User } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { NotificationDropdown } from "@/components/notification/NotificationDropdown";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/home" className="flex items-center">
            <img 
              src="/lovable-uploads/6bdd8a27-cd91-4f69-bda2-2afe0a4a0cdd.png" 
              alt="Pasar Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="text-xl font-bold font-hand">
              {t('app.name')}
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/home" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/matches" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.matches')}
            </Link>
            <Link to="/chat" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.messages')}
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <LanguageToggle />

            <NotificationDropdown />

            <Link to="/mypage">
              <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
