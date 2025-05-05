
export type Language = "ko" | "ja";

export interface TranslationMap {
  [key: string]: {
    ko: string;
    ja: string;
  };
}

export interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}
