
import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Language = "ko" | "ja";

interface TranslationMap {
  [key: string]: {
    ko: string;
    ja: string;
  };
}

// Translation dictionary
const translations: TranslationMap = {
  // App name and common
  "app.name": {
    ko: "Pasar",
    ja: "パサー"
  },
  "app.tagline": {
    ko: "한국 남성 × 일본 여성 매칭 서비스",
    ja: "韓国人男性 × 日本人女性 マッチングサービス"
  },
  
  // Common actions
  "action.next": {
    ko: "다음",
    ja: "次へ"
  },
  "action.back": {
    ko: "이전",
    ja: "戻る"
  },
  "action.submit": {
    ko: "제출하기",
    ja: "送信する"
  },
  "action.save": {
    ko: "저장하기",
    ja: "保存する"
  },
  "action.cancel": {
    ko: "취소",
    ja: "キャンセル"
  },
  "action.skip": {
    ko: "건너뛰기",
    ja: "スキップ"
  },
  "action.edit": {
    ko: "수정하기",
    ja: "編集する"
  },
  
  // Authentication
  "auth.login": {
    ko: "로그인",
    ja: "ログイン"
  },
  "auth.signup": {
    ko: "회원가입",
    ja: "会員登録"
  },
  "auth.google": {
    ko: "Google로 계속하기",
    ja: "Googleで続ける"
  },
  "auth.logout": {
    ko: "로그아웃",
    ja: "ログアウト"
  },
  "auth.login_failed": {
    ko: "로그인 실패",
    ja: "ログイン失敗"
  },
  "auth.logout_failed": {
    ko: "로그아웃 실패",
    ja: "ログアウト失敗"
  },
  "auth.try_again": {
    ko: "다시 시도해주세요",
    ja: "もう一度お試しください"
  },
  
  // Onboarding steps
  "onboarding.step": {
    ko: "단계",
    ja: "ステップ"
  },
  "onboarding.photos.title": {
    ko: "프로필 사진 등록",
    ja: "プロフィール写真の登録"
  },
  "onboarding.photos.desc": {
    ko: "매력적인 프로필 사진을 최소 3장 등록해주세요",
    ja: "魅力的なプロフィール写真を最低3枚登録してください"
  },
  "onboarding.photos.add": {
    ko: "사진 추가하기",
    ja: "写真を追加"
  },
  "onboarding.photos.min_required": {
    ko: "최소 3장의 사진이 필요합니다",
    ja: "最低3枚の写真が必要です"
  },
  "onboarding.basics.title": {
    ko: "기본 정보",
    ja: "基本情報"
  },
  "onboarding.basics.desc": {
    ko: "당신에 대한 기본 정보를 알려주세요",
    ja: "あなたの基本情報を教えてください"
  },
  "onboarding.basics.name": {
    ko: "닉네임",
    ja: "ニックネーム"
  },
  "onboarding.basics.gender": {
    ko: "성별",
    ja: "性別"
  },
  "onboarding.basics.birthdate": {
    ko: "생년월일",
    ja: "生年月日"
  },
  "onboarding.basics.nationality": {
    ko: "국적",
    ja: "国籍"
  },
  "onboarding.basics.city": {
    ko: "거주 도시",
    ja: "居住都市"
  },
  "onboarding.questions.title": {
    ko: "조금 더 알고 싶어요",
    ja: "もう少し教えてください"
  },
  "onboarding.questions.job": {
    ko: "직업",
    ja: "職業"
  },
  "onboarding.questions.education": {
    ko: "학력",
    ja: "学歴"
  },
  "onboarding.questions.languages": {
    ko: "언어 능력",
    ja: "言語能力"
  },
  "onboarding.questions.interests": {
    ko: "관심사",
    ja: "興味・関心"
  },
  "onboarding.verification.title": {
    ko: "신분증 인증 (선택)",
    ja: "本人確認 (任意)"
  },
  "onboarding.verification.desc": {
    ko: "신뢰할 수 있는 만남을 위한 신분증 인증을 진행해보세요",
    ja: "信頼できる出会いのための本人確認を行いましょう"
  },
  
  // Profile
  "profile.about": {
    ko: "자기소개",
    ja: "自己紹介"
  },
  "profile.details": {
    ko: "프로필 정보",
    ja: "プロフィール情報"
  },
  "profile.verified": {
    ko: "인증됨",
    ja: "認証済み"
  },
  "profile.pending": {
    ko: "인증 진행중",
    ja: "認証処理中"
  },
  
  // Error messages
  "error.generic": {
    ko: "오류가 발생했습니다",
    ja: "エラーが発生しました"
  },
  "error.try_again": {
    ko: "다시 시도해주세요",
    ja: "もう一度お試しください"
  },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize language based on URL path or default to Korean
  const initialLang = location.pathname.startsWith("/ja") ? "ja" : "ko";
  const [language, setLanguageState] = useState<Language>(initialLang);
  
  // Function to update language and redirect to corresponding URL path
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    
    // Update URL to reflect language change if not already on that language path
    if (lang === "ko" && location.pathname.startsWith("/ja")) {
      navigate(location.pathname.replace("/ja", "/ko"));
    } else if (lang === "ja" && location.pathname.startsWith("/ko")) {
      navigate(location.pathname.replace("/ko", "/ja"));
    } else if (!location.pathname.startsWith("/ko") && !location.pathname.startsWith("/ja")) {
      // If not on a language-specific path, redirect to the appropriate one
      navigate(`/${lang}${location.pathname}`);
    }
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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
