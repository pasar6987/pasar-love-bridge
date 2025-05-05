
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { determineBestLanguage } from "@/utils/ipLanguageDetection";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectBasedOnParams = async () => {
      // URL에 access_token이 포함되어 있는지 확인
      const url = window.location.href;
      const hasAuthParams = url.includes("access_token=") || 
                             url.includes("code=") || 
                             url.includes("error=") || 
                             url.includes("provider=");
                              
      if (!hasAuthParams) {
        // 인증 파라미터가 없는 경우에 IP 기반 언어 감지 수행
        setIsLoading(true);
        try {
          const detectedLang = await determineBestLanguage();
          console.log("감지된 최적 언어:", detectedLang);
          
          // 로컬 스토리지에 감지된 언어 저장 (추후 참조용)
          localStorage.setItem('detected_language', detectedLang);
          
          // 해당 언어 경로로 리디렉션
          navigate(`/${detectedLang}`);
        } catch (error) {
          console.error("언어 감지 오류:", error);
          // 오류 발생 시 기본 한국어로 리디렉션
          navigate('/ko');
        } finally {
          setIsLoading(false);
        }
      } else {
        // 인증 파라미터가 있는 경우 Supabase Auth가 자동으로 처리하고
        // 성공적으로 로그인 후에는 감지된 언어 또는 저장된 언어로 리디렉션
        setIsLoading(false);
      }
    };

    redirectBasedOnParams();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
