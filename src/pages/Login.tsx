
import { LoginForm } from "@/components/auth/LoginForm";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "react-router-dom";
import { Globe, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "ja" : "ko");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Heart className="h-6 w-6 text-pastel-pink mr-2" />
          <span className="text-xl font-bold font-hand">{t("app.name")}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="flex items-center space-x-1"
        >
          <Globe className="h-4 w-4" />
          <span>{language === "ko" ? "日本語" : "한국어"}</span>
        </Button>
      </header>

      <div className="flex-grow flex items-center justify-center p-6">
        <div className="flex flex-col-reverse md:flex-row rounded-2xl shadow-soft overflow-hidden max-w-5xl w-full">
          <div className="bg-gradient-to-br from-pastel-pink to-pastel-lavender md:w-1/2 p-10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6 font-hand text-primary-foreground">
                {t("app.tagline")}
              </h2>
              <ul className="space-y-4 text-primary-foreground/90">
                <li className="flex items-start">
                  <Heart className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>
                    {language === "ko"
                      ? "한국 남성과 일본 여성이 만나는 특별한 공간"
                      : "韓国人男性と日本人女性が出会う特別な場所"}
                  </span>
                </li>
                <li className="flex items-start">
                  <Heart className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>
                    {language === "ko"
                      ? "언어 장벽을 넘는 번역 기능"
                      : "言語の壁を越える翻訳機能"}
                  </span>
                </li>
                <li className="flex items-start">
                  <Heart className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                  <span>
                    {language === "ko"
                      ? "진정한 연결을 위한 안전 인증 시스템"
                      : "真のつながりのための安全認証システム"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white md:w-1/2 p-10 flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
      </div>

      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Pasar. All rights reserved.
      </footer>
    </div>
  );
}
