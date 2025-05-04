
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Check, Upload } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface VerificationProps {
  onComplete: () => void;
}

export function Verification({ onComplete }: VerificationProps) {
  const { t, language } = useLanguage();
  const [docType, setDocType] = useState("");
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleFileChange = () => {
    setFrontUploaded(true);
  };
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/home');
    }, 1500);
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
              <SelectItem value="resident_card">
                {language === "ko" ? "주민등록증" : "住民基本台帳カード"}
              </SelectItem>
              <SelectItem value="driver_license">
                {language === "ko" ? "운전면허증" : "運転免許証"}
              </SelectItem>
              <SelectItem value="passport">
                {language === "ko" ? "여권" : "パスポート"}
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
              {language === "ko" ? "신분증 앞면" : "身分証明書の表面"}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center">
              {frontUploaded ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-pastel-mint flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {language === "ko" ? "파일이 업로드되었습니다" : "ファイルがアップロードされました"}
                  </p>
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
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </form>
      
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onComplete}
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
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
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
