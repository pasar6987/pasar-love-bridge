import { createContext, useState, ReactNode, useEffect } from "react";
import { translations } from "./translations";
import { Language, LanguageContextProps } from "./types";
import { determineBestLanguage } from "@/utils/ipLanguageDetection";

export const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 초기 언어 설정 - 로컬 스토리지에서 가져오거나 기본값으로 한국어 사용
  const getInitialLanguage = (): Language => {
    // 처음에는 로컬 스토리지에서 저장된 언어 설정을 확인
    const savedLanguage = localStorage.getItem('user_selected_language') as Language | null;
    return savedLanguage === 'ja' || savedLanguage === 'ko' ? savedLanguage : 'ko';
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    // 언어 감지 시도 (최초 로딩 시)
    const detectLanguage = async () => {
      // 사용자가 명시적으로 언어를 선택한 적이 없을 경우에만 감지 수행
      if (!localStorage.getItem('user_selected_language')) {
        try {
          const detectedLang = await determineBestLanguage();
          setLanguageState(detectedLang);
          localStorage.setItem('user_selected_language', detectedLang);
          console.log('감지된 언어 설정:', detectedLang);
        } catch (error) {
          console.error('언어 감지 오류:', error);
          // 오류 시 기본값 한국어로 설정
          setLanguageState('ko');
          localStorage.setItem('user_selected_language', 'ko');
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
  
  // 번역 함수 - 매개변수 처리 추가
  const t = (key: string, params?: Record<string, any>): string => {
    try {
      // 중첩된 키 처리 (예: "profile.settings.title")
      const keys = key.split('.');
      let currentTranslation: any = translations;
      
      // 중첩된 객체를 순회하며 번역 찾기
      for (const k of keys) {
        if (!currentTranslation || !currentTranslation[k]) {
          console.warn(`Translation missing for key: ${key}`);
          return key;
        }
        currentTranslation = currentTranslation[k];
      }
      
      // 현재 언어의 번역 가져오기
      let translatedText = currentTranslation[language];
      
      // 번역 텍스트가 없는 경우 다른 언어의 번역을 시도
      if (!translatedText) {
        const fallbackLang = language === 'ko' ? 'ja' : 'ko';
        translatedText = currentTranslation[fallbackLang];
        
        if (!translatedText) {
          console.warn(`Translation missing for key ${key} in both languages`);
          return key;
        }
      }
      
      // 매개변수가 있는 경우 처리
      if (params) {
        Object.keys(params).forEach(param => {
          const regex = new RegExp(`{${param}}`, 'g');
          translatedText = translatedText.replace(regex, String(params[param]));
        });
      }
      
      return translatedText;
    } catch (error) {
      console.error(`Translation error for key ${key}:`, error);
      return key;
    }
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
