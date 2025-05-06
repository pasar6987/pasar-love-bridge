
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { RecommendationList } from "@/components/recommendation/RecommendationList";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { canAccessRecommendations } from "@/utils/verificationHelpers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Recommendations() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const checkAccess = async () => {
      try {
        const hasAccess = await canAccessRecommendations();
        setCanAccess(hasAccess);
        
        if (!hasAccess) {
          toast({
            title: language === "ko" ? "접근 제한됨" : "アクセス制限",
            description: language === "ko" 
              ? "신분증 인증이 필요합니다."
              : "身分証明書の認証が必要です。",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error checking access:", error);
        setCanAccess(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, navigate, toast, language]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!canAccess) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Alert className="mb-6">
            <AlertTitle>
              {language === "ko" ? "신분증 인증이 필요합니다" : "身分証明書の認証が必要です"}
            </AlertTitle>
            <AlertDescription>
              {language === "ko" 
                ? "추천 기능을 이용하려면 신분증 인증이 필요합니다. 인증을 완료해주세요."
                : "おすすめ機能を利用するには身分証明書の認証が必要です。認証を完了してください。"}
            </AlertDescription>
          </Alert>
          
          <div className="text-center mt-6">
            <Button onClick={() => navigate("/verify")}>
              {language === "ko" ? "신분증 인증하기" : "身分証明書を認証する"}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          {language === "ko" ? "오늘의 추천" : "今日のおすすめ"}
        </h1>
        
        <RecommendationList />
      </div>
    </MainLayout>
  );
}
