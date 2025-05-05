
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { determineBestLanguage } from "@/utils/ipLanguageDetection";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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
          // 로그인 여부에 따라 리다이렉션
          if (user) {
            navigate('/home');
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error("리다이렉션 오류:", error);
          navigate('/login');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 인증 파라미터가 있는 경우 Supabase Auth가 자동으로 처리
        setIsLoading(false);
      }
    };

    // 언어 감지 후 사용자 상태 확인
    const detectAndRedirect = async () => {
      if (!localStorage.getItem('user_selected_language')) {
        try {
          const detectedLang = await determineBestLanguage();
          localStorage.setItem('user_selected_language', detectedLang);
        } catch (error) {
          console.error("언어 감지 오류:", error);
        }
      }
      
      redirectUser();
    };

    detectAndRedirect();
  }, [navigate, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
