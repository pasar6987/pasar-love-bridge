import React from 'react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/useLanguage";
import { Loader2 } from "lucide-react";

interface NationalitySelectionProps {
  onComplete: () => void;
  tempData: "ko" | "ja" | null;
  updateTempData: (value: "ko" | "ja" | null) => void;
}

export function NationalitySelection({ 
  onComplete, 
  tempData, 
  updateTempData 
}: NationalitySelectionProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [countryCode, setCountryCode] = useState<"ko" | "ja" | null>(tempData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);
  
  // 국적이 선택되면 임시 데이터 업데이트
  const handleCountryCodeChange = (value: "ko" | "ja") => {
    setCountryCode(value);
    updateTempData(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode) return;
    setIsSubmitting(true);
    try {
      // DB 저장 없이 상위로만 전달
      onComplete();
    } catch (error) {
      console.error("Error saving countryCode:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
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
          {t("onboarding.nationality.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("onboarding.nationality.desc")}
        </p>
      </div>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            className={`pasar-card flex flex-col items-center justify-center p-6 h-auto aspect-square transition-all ${
              countryCode === "ko" ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            variant="outline"
            onClick={() => handleCountryCodeChange("ko")}
          >
            <span className="text-3xl mb-2">🇰🇷</span>
            <span className="font-medium">한국</span>
            <span className="text-xs text-muted-foreground mt-1">Korea</span>
          </Button>
          
          <Button
            type="button"
            className={`pasar-card flex flex-col items-center justify-center p-6 h-auto aspect-square transition-all ${
              countryCode === "ja" ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            variant="outline"
            onClick={() => handleCountryCodeChange("ja")}
          >
            <span className="text-3xl mb-2">🇯🇵</span>
            <span className="font-medium">日本</span>
            <span className="text-xs text-muted-foreground mt-1">Japan</span>
          </Button>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            className="pasar-btn"
            disabled={!countryCode || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "ko" ? "저장 중..." : "保存中..."}
              </div>
            ) : (
              t("action.next")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
