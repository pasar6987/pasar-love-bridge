
import { Home, Heart, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";

export function MobileNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/recommendations"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/recommendations") || isActive("/home") ? "text-primary" : "text-gray-500"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.home")}</span>
        </Link>
        
        <Link
          to="/matches"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/matches") ? "text-primary" : "text-gray-500"
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.matches")}</span>
        </Link>
        
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/chat") ? "text-primary" : "text-gray-500"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.messages")}</span>
        </Link>
        
        <Link
          to="/mypage"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/mypage") || isActive("/profile") ? "text-primary" : "text-gray-500"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{t("nav.profile")}</span>
        </Link>
      </div>
    </nav>
  );
}
