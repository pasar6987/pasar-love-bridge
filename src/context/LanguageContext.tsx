
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'ko' | 'ja';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations: Record<string, Record<Language, string>> = {
  // Common
  'app.name': {
    ko: 'Pasar',
    ja: 'パサル',
  },
  'app.tagline': {
    ko: '한국 남성 × 일본 여성 매칭 서비스',
    ja: '韓国人男性 × 日本人女性 マッチングサービス',
  },
  
  // Auth
  'auth.login': {
    ko: '로그인',
    ja: 'ログイン',
  },
  'auth.signup': {
    ko: '회원가입',
    ja: '会員登録',
  },
  'auth.email': {
    ko: '이메일',
    ja: 'メールアドレス',
  },
  'auth.password': {
    ko: '비밀번호',
    ja: 'パスワード',
  },
  'auth.forgotPassword': {
    ko: '비밀번호를 잊으셨나요?',
    ja: 'パスワードをお忘れですか？',
  },
  'auth.continueWith': {
    ko: '다음으로 계속하기',
    ja: 'こちらで続ける',
  },
  'auth.google': {
    ko: '구글',
    ja: 'Google',
  },
  
  // Onboarding
  'onboarding.welcome': {
    ko: '환영합니다!',
    ja: 'ようこそ！',
  },
  'onboarding.step': {
    ko: '단계',
    ja: 'ステップ',
  },
  'onboarding.photos.title': {
    ko: '프로필 사진 업로드',
    ja: 'プロフィール写真のアップロード',
  },
  'onboarding.photos.desc': {
    ko: '최소 1장의 얼굴이 잘 보이는 사진을 업로드해주세요.',
    ja: '顔がはっきり見える写真を最低1枚アップロードしてください。',
  },
  'onboarding.photos.add': {
    ko: '사진 추가하기',
    ja: '写真を追加',
  },
  'onboarding.basics.title': {
    ko: '기본 정보',
    ja: '基本情報',
  },
  'onboarding.basics.name': {
    ko: '이름',
    ja: '名前',
  },
  'onboarding.basics.gender': {
    ko: '성별',
    ja: '性別',
  },
  'onboarding.basics.birthdate': {
    ko: '생년월일',
    ja: '生年月日',
  },
  'onboarding.basics.nationality': {
    ko: '국적',
    ja: '国籍',
  },
  'onboarding.basics.city': {
    ko: '거주 도시',
    ja: '居住都市',
  },
  'onboarding.questions.title': {
    ko: '나에 대해 더 알려주세요',
    ja: 'あなたについてもっと教えてください',
  },
  'onboarding.questions.job': {
    ko: '직업',
    ja: '職業',
  },
  'onboarding.questions.education': {
    ko: '학력',
    ja: '学歴',
  },
  'onboarding.questions.interests': {
    ko: '관심사',
    ja: '興味',
  },
  'onboarding.questions.languages': {
    ko: '구사 언어',
    ja: '言語スキル',
  },
  'onboarding.verification.title': {
    ko: '본인 인증',
    ja: '本人確認',
  },
  'onboarding.verification.desc': {
    ko: '안전한 매칭을 위해 신분증 인증이 필요합니다.',
    ja: '安全なマッチングのために身分証明書の確認が必要です。',
  },
  
  // Navigation
  'nav.home': {
    ko: '홈',
    ja: 'ホーム',
  },
  'nav.matches': {
    ko: '매치',
    ja: 'マッチ',
  },
  'nav.chat': {
    ko: '채팅',
    ja: 'チャット',
  },
  'nav.profile': {
    ko: '프로필',
    ja: 'プロフィール',
  },
  
  // Home
  'home.recommendations': {
    ko: '오늘의 추천',
    ja: '本日のおすすめ',
  },
  'home.noMore': {
    ko: '오늘의 추천을 모두 확인했습니다. 내일 다시 방문해주세요!',
    ja: '本日のおすすめはすべて確認しました。また明日お越しください！',
  },
  
  // Profile
  'profile.age': {
    ko: '세',
    ja: '歳',
  },
  'profile.about': {
    ko: '소개',
    ja: '自己紹介',
  },
  'profile.details': {
    ko: '상세 정보',
    ja: '詳細情報',
  },
  
  // Actions
  'action.next': {
    ko: '다음',
    ja: '次へ',
  },
  'action.back': {
    ko: '이전',
    ja: '戻る',
  },
  'action.save': {
    ko: '저장',
    ja: '保存',
  },
  'action.cancel': {
    ko: '취소',
    ja: 'キャンセル',
  },
  'action.send': {
    ko: '전송',
    ja: '送信',
  },
  'action.like': {
    ko: '관심 있어요',
    ja: '興味があります',
  },
  'action.pass': {
    ko: '다음에',
    ja: '今度',
  },
  
  // Chat
  'chat.newMatch': {
    ko: '새로운 매치',
    ja: '新しいマッチ',
  },
  'chat.icebreaker': {
    ko: '아이스브레이커 사용하기',
    ja: 'アイスブレーカーを使う',
  },
  'chat.randomTopic': {
    ko: '랜덤 주제',
    ja: 'ランダムトピック',
  },
  'chat.translate': {
    ko: '번역하기',
    ja: '翻訳する',
  },
  'chat.writeMessage': {
    ko: '메시지 작성...',
    ja: 'メッセージを書く...',
  },
  
  // Settings
  'settings.title': {
    ko: '설정',
    ja: '設定',
  },
  'settings.account': {
    ko: '계정',
    ja: 'アカウント',
  },
  'settings.notifications': {
    ko: '알림',
    ja: '通知',
  },
  'settings.language': {
    ko: '언어',
    ja: '言語',
  },
  'settings.privacy': {
    ko: '개인 정보',
    ja: 'プライバシー',
  },
  'settings.help': {
    ko: '도움말',
    ja: 'ヘルプ',
  },
  'settings.logout': {
    ko: '로그아웃',
    ja: 'ログアウト',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ko');

  // Initialize language based on URL path or browser language
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/ja')) {
      setLanguage('ja');
    } else if (path.startsWith('/ko')) {
      setLanguage('ko');
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      setLanguage(browserLang === 'ja' ? 'ja' : 'ko');
    }
  }, []);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
