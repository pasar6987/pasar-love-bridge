
import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Upload, Loader2, Shield } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { uploadIdentityDocument } from "@/utils/storageHelpers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function VerifyIdentity() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [docType, setDocType] = useState("");
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(true);
  
  // Check if user is already verified
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        // Get verification status from users table
        const { data, error } = await supabase
          .from('users')
          .select('is_verified')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setIsVerified(data?.is_verified || false);
        
        if (data?.is_verified) {
          // If already verified, redirect to home
          navigate('/home');
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setVerificationLoading(false);
      }
    };
    
    checkVerification();
  }, [user, navigate]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFrontUploaded(true);
    }
  };
  
  const handleSubmit = async () => {
    if (!file || !docType || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload ID document to Storage - 이제 파일 경로만 반환
      const filePath = await uploadIdentityDocument(user.id, file);
      
      // Save verification record in the database
      const { error } = await supabase
        .from('identity_verifications')
        .insert({
          user_id: user.id,
          country_code: language === "ko" ? "KR" : "JP",
          doc_type: docType,
          id_front_url: filePath,  // 이제 파일 경로만 저장
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: language === "ko" ? "신분증이 제출되었습니다" : "身分証明書が提出されました",
        description: language === "ko" ? "검토 후 알림으로 알려드립니다" : "審査後、通知でお知らせします"
      });
      
      navigate('/home');
      
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({
        title: t("error.generic"),
        description: error instanceof Error ? error.message : t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    navigate('/home');
  };
  
  if (verificationLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 py-12">
        <Card className="shadow-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-pastel-mint/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              {t("verify.title")}
            </CardTitle>
            <CardDescription>
              {t("verify.desc")}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-pastel-mint/30 rounded-lg p-4 border border-pastel-mint">
              <p className="text-sm">
                {language === 'ko' 
                  ? "신분증 정보는 안전하게 암호화되어 저장됩니다. 신분증 인증은 안전한 매칭 서비스를 제공하기 위함입니다."
                  : "身分証明書の情報は安全に暗号化されて保存されます。身分証明書の確認は安全なマッチングサービスを提供するためです。"}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="docType" className="text-sm font-medium">
                  {language === 'ko' ? "신분증 종류" : "身分証明書の種類"}
                </label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger id="docType" className="pasar-input">
                    <SelectValue placeholder={language === 'ko' ? "신분증 종류 선택" : "身分証明書の種類を選択"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident_card">
                      {language === 'ko' ? "주민등록증" : "住民基本台帳カード"}
                    </SelectItem>
                    <SelectItem value="driver_license">
                      {language === 'ko' ? "운전면허증" : "運転免許証"}
                    </SelectItem>
                    <SelectItem value="passport">
                      {language === 'ko' ? "여권" : "パスポート"}
                    </SelectItem>
                    {language === "ja" && (
                      <SelectItem value="my_number_card">
                        マイナンバーカード
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {docType && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {language === 'ko' ? "신분증 앞면" : "身分証明書の表面"}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center relative">
                    {frontUploaded ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-pastel-mint flex items-center justify-center mb-3">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {language === 'ko' ? "파일이 업로드되었습니다" : "ファイルがアップロードされました"}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setFrontUploaded(false);
                            setFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          {language === 'ko' ? "다시 선택" : "再選択"}
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'ko' 
                            ? "이미지를 끌어다 놓거나 클릭하여 업로드" 
                            : "画像をドラッグ＆ドロップするか、クリックしてアップロード"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {language === 'ko' ? "JPG, PNG, 최대 5MB" : "JPG、PNG、最大5MB"}
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${frontUploaded ? 'hidden' : ''}`}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="rounded-full"
              >
                {t("verify.later")}
              </Button>
              <Button
                onClick={handleSubmit}
                className="pasar-btn"
                disabled={!docType || !frontUploaded || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'ko' ? "제출 중..." : "送信中..."}
                  </span>
                ) : (
                  language === 'ko' ? "제출하기" : "送信する"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
