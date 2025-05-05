
import { createContext, useState, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { translations } from "./translations";
import { Language, LanguageContextProps } from "./types";
import { determineBestLanguage } from "@/utils/ipLanguageDetection";

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  
  // 초기 언어 설정 - 로컬 스토리지에서 가져오거나 기본값으로 한국어 사용
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('user_selected_language') as Language | null;
    return savedLanguage === 'ja' ? 'ja' : 'ko';
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    // URL 파라미터가 있을 때만 언어 감지 시도 (최초 로딩 시)
    const detectLanguage = async () => {
      if (!localStorage.getItem('user_selected_language')) {
        try {
          const detectedLang = await determineBestLanguage();
          setLanguageState(detectedLang);
          localStorage.setItem('user_selected_language', detectedLang);
        } catch (error) {
          console.error('언어 감지 오류:', error);
        }
      }
    };

    detectLanguage();
  }, []);
  
  // 언어 변경 함수
  const setLanguage = (lang: Language) => {
    localStorage.setItem('user_selected_language', lang);
    setLanguageState(lang);
  };
  
  // 번역 함수
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
