import React from 'react';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import { Check, Upload, Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { uploadIdentityDocument } from "@/utils/storageHelpers";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VerificationProps {
  onComplete: () => void;
  tempData: {
    docType: string;
    frontUploaded: boolean;
    file: File | null;
  };
  countryCode: "ko" | "ja" | null;
  updateTempData: (value: {
    docType: string;
    frontUploaded: boolean;
    file: File | null;
  }) => void;
  allTempData: any; // 추가: 4단계까지의 모든 임시 데이터
}

export function Verification({ onComplete, tempData, countryCode, updateTempData, allTempData }: VerificationProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [docType, setDocType] = useState(tempData.docType || "");
  const [frontUploaded, setFrontUploaded] = useState(tempData.frontUploaded || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(tempData.file || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 임시 데이터 업데이트
  useEffect(() => {
    updateTempData({
      docType,
      frontUploaded,
      file
    });
  }, [docType, frontUploaded, file, updateTempData]);
  
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
      // 1. 4단계까지의 온보딩 결과 users 테이블에 저장
      const { countryCode, basicInfo, questions } = allTempData;
      const { error: userError } = await supabase.from('users').update({
        nickname: basicInfo.name,
        country_code: countryCode,
        name: basicInfo.name,
        gender: basicInfo.gender,
        birthdate: basicInfo.birthdate,
        city: basicInfo.city,
        bio: questions.bio,
        onboarding_completed: false,
        onboarding_step: 5,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      if (userError) throw userError;
      // 2. 신분증 파일 업로드
      const idFrontUrl = await uploadIdentityDocument(user.id, file);
      // 3. DB 저장 (identity_verifications 테이블에 insert)
      const { error } = await supabase.from('identity_verifications').insert({
        user_id: user.id,
        doc_type: docType,
        country_code: countryCode,
        id_front_url: idFrontUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
  
  const handleSkip = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // 4단계까지의 온보딩 결과 users 테이블에 저장
      const { countryCode, basicInfo, questions } = allTempData;
      await supabase.from('users').update({
        nickname: basicInfo.name,
        country_code: countryCode,
        name: basicInfo.name,
        gender: basicInfo.gender,
        birthdate: basicInfo.birthdate,
        city: basicInfo.city,
        bio: questions.bio,
        onboarding_completed: false,
        onboarding_step: 5,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      onComplete();
    } catch (error) {
      console.error("Error skipping verification and saving user info:", error);
      toast({
        title: t("error.generic"),
        description: error instanceof Error ? error.message : t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {t("onboarding.verification.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("onboarding.verification.desc")}
        </p>
      </div>
      
      <div className="bg-pastel-mint/30 rounded-lg p-4 border border-pastel-mint">
        <p className="text-sm">
          {language === "ko" 
            ? "신분증 정보는 안전하게 암호화되어 저장됩니다. 신분증 인증은 안전한 매칭 서비스를 제공하기 위함입니다."
            : "身分証明書の情報は安全に暗号化されて保存されます。身分証明書の確認は安全なマッチングサービスを提供するためです。"}
        </p>
      </div>
      
      <form className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="docType" className="text-sm font-medium">
            {language === "ko" ? "신분증 종류" : "身分証明書の種類"}
          </label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger id="docType" className="pasar-input">
              <SelectValue placeholder={language === "ko" ? "신분증 종류 선택" : "身分証明書の種類を選択"} />
            </SelectTrigger>
            <SelectContent>
              {/* 일본 국적일 때만 운전면허증, 마이넘버카드, 여권만 노출 */}
              {countryCode === 'ja' ? (
                <>
                  <SelectItem value="driver_license">
                    {language === "ko" ? "운전면허증" : "運転免許証"}
                  </SelectItem>
                  <SelectItem value="my_number_card">
                    {language === "ko" ? "마이넘버카드" : "マイナンバーカード"}
                  </SelectItem>
                  <SelectItem value="passport">
                    {language === "ko" ? "여권" : "パスポート"}
                  </SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="resident_card">
                    {language === "ko" ? "주민등록증" : "住民基本台帳カード"}
                  </SelectItem>
                  <SelectItem value="driver_license">
                    {language === "ko" ? "운전면허증" : "運転免許証"}
                  </SelectItem>
                  <SelectItem value="passport">
                    {language === "ko" ? "여권" : "パスポート"}
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {docType && (
          <div className="space-y-3">
            <label className="text-sm font-medium">
              {language === "ko" ? "신분증 앞면" : "身分証明書の表面"}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center relative">
              {frontUploaded ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-pastel-mint flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {language === "ko" ? "파일이 업로드되었습니다" : "ファイルがアップロードされました"}
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
                    {language === "ko" ? "다시 선택" : "再選択"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {language === "ko" 
                      ? "이미지를 끌어다 놓거나 클릭하여 업로드" 
                      : "画像をドラッグ＆ドロップするか、クリックしてアップロード"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === "ko" ? "JPG, PNG, 최대 5MB" : "JPG、PNG、最大5MB"}
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
      </form>
      
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="rounded-full"
        >
          {language === "ko" ? "나중에 하기" : "後でする"}
        </Button>
        <Button
          onClick={handleSubmit}
          className="pasar-btn"
          disabled={!docType || !frontUploaded || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "ko" ? "제출 중..." : "送信中..."}
            </span>
          ) : (
            language === "ko" ? "제출하기" : "送信する"
          )}
        </Button>
      </div>
    </div>
  );
}
