
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // URL에 access_token이 포함되어 있는지 확인
    const url = window.location.href;
    const hasAuthParams = url.includes("access_token=") || 
                           url.includes("code=") || 
                           url.includes("error=") || 
                           url.includes("provider=");
                            
    if (!hasAuthParams) {
      // 인증 파라미터가 없는 경우에만 언어 기반 리디렉션 수행
      const userLang = navigator.language.toLowerCase();
      const targetLang = userLang.includes("ja") ? "ja" : "ko";
      navigate(`/${targetLang}`);
    }
    // 인증 파라미터가 있는 경우 Supabase Auth가 자동으로 처리
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
