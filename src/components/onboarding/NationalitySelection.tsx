
import { useState } from "react";
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nationality || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Add user nationality to the database using RPC
      // In a production app, we would create an RPC function:
      // const { error } = await supabase.rpc('insert_user_nationality', {
      //   p_user_id: user.id,
      //   p_nationality: nationality
      // });
      
      // For now, use direct table operation
      const { error } = await supabase
        .from('user_nationalities')
        .insert({
          user_id: user.id,
          nationality
        });
      
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
