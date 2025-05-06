
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

  useEffect(() => {
    const redirectUser = async () => {
      // URL에 access_token이 포함되어 있는지 확인
      const url = window.location.href;
      const hasAuthParams = url.includes("access_token=") || 
                           url.includes("code=") || 
                           url.includes("error=") || 
                           url.includes("provider=");
                            
      if (!hasAuthParams) {
        try {
          // 언어 감지 수행
          if (!localStorage.getItem('user_selected_language')) {
            try {
              const detectedLang = await determineBestLanguage();
              localStorage.setItem('user_selected_language', detectedLang);
              setLanguage(detectedLang);
            } catch (error) {
              console.error("언어 감지 오류:", error);
              // 오류 시 기본값 한국어로 설정
              localStorage.setItem('user_selected_language', 'ko');
              setLanguage('ko');
            }
          }
          
          // Only redirect on the landing page (/) 
          // This fixes the issue where all page navigations redirect to home
          if (window.location.pathname === '/') {
            if (user) {
              navigate('/home');
            } else {
              navigate('/login');
            }
          }
        } catch (error) {
          console.error("리디렉션 오류:", error);
          // Only redirect on errors if we're on the landing page
          if (window.location.pathname === '/') {
            navigate('/login');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // 인증 파라미터가 있는 경우 Supabase Auth가 자동으로 처리
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
