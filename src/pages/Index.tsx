
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { determineBestLanguage } from "@/utils/ipLanguageDetection";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/useLanguage";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { setLanguage } = useLanguage();

  // 디버깅을 위한 로그 함수
  const logIndexDebug = (message: string, data?: any) => {
    console.log(`[Index Debug] ${message}`, data || '');
  };

  useEffect(() => {
    const redirectUser = async () => {
      logIndexDebug("Index 페이지 리디렉션 로직 시작", { pathname: window.location.pathname, user: !!user });
      
      // URL에 access_token이 포함되어 있는지 확인
      const url = window.location.href;
      const hasAuthParams = url.includes("access_token=") || 
                           url.includes("code=") || 
                           url.includes("error=") || 
                           url.includes("provider=");
                            
      logIndexDebug("URL 인증 파라미터 확인", { hasAuthParams });
                            
      if (!hasAuthParams) {
        try {
          // 언어 감지 수행
          if (!localStorage.getItem('user_selected_language')) {
            logIndexDebug("사용자 선택 언어 없음, 언어 감지 시작");
            try {
              const detectedLang = await determineBestLanguage();
              logIndexDebug("언어 감지 완료", { detectedLang });
              localStorage.setItem('user_selected_language', detectedLang);
              setLanguage(detectedLang);
            } catch (error) {
              logIndexDebug("언어 감지 오류", error);
              // 오류 시 기본값 한국어로 설정
              localStorage.setItem('user_selected_language', 'ko');
              setLanguage('ko');
            }
          } else {
            const savedLang = localStorage.getItem('user_selected_language');
            logIndexDebug("저장된 언어 사용", { savedLang });
          }
          
          // Only redirect on the landing page (/) 
          // This fixes the issue where all page navigations redirect to home
          if (window.location.pathname === '/') {
            logIndexDebug("루트 경로에서 리디렉션 시작", { user: !!user });
            if (user) {
              logIndexDebug("사용자 로그인됨, 홈으로 리디렉션");
              navigate('/home');
            } else {
              logIndexDebug("사용자 로그인 안됨, 로그인 페이지로 리디렉션");
              navigate('/login');
            }
          } else {
            logIndexDebug("루트 경로가 아님, 리디렉션 없음", { pathname: window.location.pathname });
          }
        } catch (error) {
          logIndexDebug("리디렉션 오류", error);
          // Only redirect on errors if we're on the landing page
          if (window.location.pathname === '/') {
            navigate('/login');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // 인증 파라미터가 있는 경우 Supabase Auth가 자동으로 처리
        logIndexDebug("인증 파라미터 있음, Supabase Auth가 처리");
        setIsLoading(false);
      }
    };

    redirectUser();
  }, [navigate, user, setLanguage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
