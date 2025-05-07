
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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
  
  const [nationality, setNationality] = useState<"ko" | "ja" | null>(tempData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);
  
  // 기존 사용자 국적 데이터 확인
  useEffect(() => {
    const checkExistingNationality = async () => {
      if (!user) return;
      
      try {
        // 사용자 국적 데이터 조회 - now directly from users table
        const { data, error } = await supabase
          .from('users')
          .select('nationality')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        // 기존 데이터가 있으면 설정
        if (data && data.nationality) {
          setNationality(data.nationality as "ko" | "ja");
          updateTempData(data.nationality as "ko" | "ja");
          setExisting(true);
        }
      } catch (error) {
        console.error("Error checking nationality:", error);
      }
    };
    
    if (!nationality) {
      checkExistingNationality();
    }
  }, [user, nationality, updateTempData]);
  
  // 국적이 선택되면 임시 데이터 업데이트
  const handleNationalityChange = (value: "ko" | "ja") => {
    setNationality(value);
    updateTempData(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nationality || !user) return;
    
    setIsSubmitting(true);
    
    try {
      let error = null;
      
      // Update the nationality directly in the users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ nationality })
        .eq('id', user.id);
          
      error = updateError;
      
      if (error) throw error;
      
      // For compatibility with existing code during migration, also update the user_nationalities table
      if (!existing) {
        const { error: insertError } = await supabase
          .from('user_nationalities')
          .insert({
            user_id: user.id,
            nationality
          });
          
        if (insertError) {
          console.warn("Error updating user_nationalities table (legacy):", insertError);
          // Don't throw error here as this is just for compatibility
        }
      }
      
      onComplete();
    } catch (error) {
      console.error("Error saving nationality:", error);
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
              nationality === "ko" ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            variant="outline"
            onClick={() => handleNationalityChange("ko")}
          >
            <span className="text-3xl mb-2">🇰🇷</span>
            <span className="font-medium">한국</span>
            <span className="text-xs text-muted-foreground mt-1">Korea</span>
          </Button>
          
          <Button
            type="button"
            className={`pasar-card flex flex-col items-center justify-center p-6 h-auto aspect-square transition-all ${
              nationality === "ja" ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
            variant="outline"
            onClick={() => handleNationalityChange("ja")}
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
            disabled={!nationality || isSubmitting}
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
