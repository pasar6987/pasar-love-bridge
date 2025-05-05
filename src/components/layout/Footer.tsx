
import { useLanguage } from "@/i18n/useLanguage";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <img 
              src="/lovable-uploads/6bdd8a27-cd91-4f69-bda2-2afe0a4a0cdd.png" 
              alt="Pasar Logo" 
              className="h-5 w-5 mr-2" 
            />
            <span className="text-lg font-hand">
              {t('app.name')}
            </span>
          </div>
          
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-400 md:text-right">
              &copy; {new Date().getFullYear()} Pasar. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
