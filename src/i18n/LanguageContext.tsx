
import { createContext, useState, ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { translations } from "./translations";
import { Language, LanguageContextProps } from "./types";
import { determineBestLanguage } from "@/utils/ipLanguageDetection";

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL 경로에서 언어 코드 추출
  const getLanguageFromPath = (): Language => {
    if (location.pathname.startsWith("/ja")) {
      return "ja";
    }
    return "ko"; // 기본값은 한국어
  };
  
  // Initialize language based on URL path or default to Korean
  const [language, setLanguageState] = useState<Language>(getLanguageFromPath());

  useEffect(() => {
    // URL이 변경될 때마다 언어 설정 업데이트
    setLanguageState(getLanguageFromPath());
  }, [location.pathname]);
  
  // Function to update language and redirect to corresponding URL path
  const setLanguage = (lang: Language) => {
    // 사용자가 명시적으로 선택한 언어를 저장
    localStorage.setItem('user_selected_language', lang);
    
    setLanguageState(lang);
    
    // 현재 URL에서 언어 코드 부분만 변경
    const pathWithoutLang = location.pathname
      .replace(/^\/ko/, '')
      .replace(/^\/ja/, '') || '/';
    
    // 새 URL로 이동
    navigate(`/${lang}${pathWithoutLang}`);
  };
  
  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translations[key][language];
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
