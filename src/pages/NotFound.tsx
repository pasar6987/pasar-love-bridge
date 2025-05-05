
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          {t("error.page_not_found")}
        </p>
        
        <Link to="/home" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90">
          {t("nav.back_to_home")}
        </Link>
        
        <div className="mt-8">
          <LanguageToggle variant="text" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
