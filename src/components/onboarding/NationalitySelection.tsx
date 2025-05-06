
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/useLanguage";
import { Loader2 } from "lucide-react";

interface NationalitySelectionProps {
  onComplete: () => void;
}

export function NationalitySelection({ onComplete }: NationalitySelectionProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [nationality, setNationality] = useState<"ko" | "ja" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existing, setExisting] = useState<boolean>(false);
  
  // 기존 사용자 국적 데이터 확인
  useEffect(() => {
    const checkExistingNationality = async () => {
      if (!user) return;
      
      try {
        // 사용자 국적 데이터 조회
        const { data, error } = await supabase
          .from('user_nationalities')
          .select('nationality')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        // 기존 데이터가 있으면 설정
        if (data) {
          setNationality(data.nationality as "ko" | "ja");
          setExisting(true);
        }
      } catch (error) {
        console.error("Error checking nationality:", error);
      }
    };
    
    checkExistingNationality();
  }, [user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nationality || !user) return;
    
    setIsSubmitting(true);
    
    try {
      let error = null;
      
      // 기존 데이터가 있으면 업데이트, 없으면 삽입
      if (existing) {
        // 업데이트 쿼리
        const { error: updateError } = await supabase
          .from('user_nationalities')
          .update({ nationality })
          .eq('user_id', user.id);
          
        error = updateError;
      } else {
        // 삽입 쿼리
        const { error: insertError } = await supabase
          .from('user_nationalities')
          .insert({
            user_id: user.id,
            nationality
          });
          
        error = insertError;
      }
      
      if (error) throw error;
      
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
            onClick={() => setNationality("ko")}
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
            onClick={() => setNationality("ja")}
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
