
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BasicInfoProps {
  onComplete: () => void;
}

export function BasicInfo({ onComplete }: BasicInfoProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [birthdate, setBirthdate] = useState("");
  const [nationality, setNationality] = useState(language === "ko" ? "KR" : "JP");
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !birthdate || !city || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          nickname: name,
          gender,
          birthdate,
          country_code: nationality,
          city
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      onComplete();
    } catch (error) {
      console.error("Error saving basic info:", error);
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
          {t("onboarding.basics.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("onboarding.basics.desc")}
        </p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            {t("onboarding.basics.name")}
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pasar-input"
            placeholder={language === "ko" ? "홍길동" : "山田太郎"}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium">
            {t("onboarding.basics.gender")}
          </label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger className="pasar-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">
                {language === "ko" ? "남성" : "男性"}
              </SelectItem>
              <SelectItem value="female">
                {language === "ko" ? "여성" : "女性"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="birthdate" className="text-sm font-medium">
            {t("onboarding.basics.birthdate")}
          </label>
          <Input
            id="birthdate"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="pasar-input"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="nationality" className="text-sm font-medium">
            {t("onboarding.basics.nationality")}
          </label>
          <Select value={nationality} onValueChange={setNationality} required>
            <SelectTrigger className="pasar-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KR">
                {language === "ko" ? "한국" : "韓国"}
              </SelectItem>
              <SelectItem value="JP">
                {language === "ko" ? "일본" : "日本"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            {t("onboarding.basics.city")}
          </label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pasar-input"
            placeholder={language === "ko" ? "서울" : "東京"}
            required
          />
        </div>
        
        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            className="pasar-btn"
            disabled={!name || !birthdate || !city || isSubmitting}
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
