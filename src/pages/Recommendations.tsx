
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { RecommendationList } from "@/components/recommendation/RecommendationList";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { checkVerificationStatus } from "@/utils/verificationHelpers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Recommendations() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("");
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const checkAccess = async () => {
      try {
        // We still check verification status, but we don't restrict access
        const { is_verified, verification_status } = await checkVerificationStatus();
        setIsVerified(is_verified);
        setVerificationStatus(verification_status);
      } catch (error) {
        console.error("Error checking access:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, navigate, language]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
        
        {!isVerified && verificationStatus && (
          <Alert className="mb-6">
            <AlertTitle>
              {language === "ko" 
                ? "채팅 기능 이용에 제한이 있을 수 있습니다" 
                : "チャット機能の利用に制限がある場合があります"}
            </AlertTitle>
            <AlertDescription>
              {language === "ko"
                ? verificationStatus === 'submitted' || verificationStatus === 'in_review'
                  ? "신분증 인증이 검토 중입니다. 승인 후 채팅이 가능합니다. 잠시만 기다려 주세요."
                  : "채팅 기능을 이용하시려면 신분증 인증이 필요합니다."
                : verificationStatus === 'submitted' || verificationStatus === 'in_review'
                  ? "身分証明書の確認が審査中です。承認までしばらくお待ちください。承認後にチャットが可能になります。"
                  : "チャット機能を利用するには、身分証明書の認証が必要です。"}
            </AlertDescription>
          </Alert>
        )}
        
        <RecommendationList />
      </div>
    </MainLayout>
  );
}
