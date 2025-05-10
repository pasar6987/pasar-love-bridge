import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useLanguage } from "@/i18n/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { differenceInYears, parse } from "date-fns";

interface BasicInfoProps {
  onComplete: () => void;
  tempData: {
    name: string;
    gender: string;
    birthdate: string;
    city: string;
  };
  countryCode: "ko" | "ja" | null;
  updateTempData: (value: {
    name: string;
    gender: string;
    birthdate: string;
    city: string;
  }) => void;
}

export function BasicInfo({ onComplete, tempData, countryCode, updateTempData }: BasicInfoProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(tempData.name || "");
  const [gender, setGender] = useState(tempData.gender || "male");
  const [birthdate, setBirthdate] = useState(tempData.birthdate || "");
  const [city, setCity] = useState(tempData.city || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  
  // 임시 데이터 업데이트
  useEffect(() => {
    updateTempData({
      name,
      gender,
      birthdate,
      city
    });
  }, [name, gender, birthdate, city, updateTempData]);
  
  // 나이 검증 함수
  const validateAge = (birthdate: string): boolean => {
    if (!birthdate || !countryCode) return false;
    
    try {
      const birthdateObj = parse(birthdate, 'yyyy-MM-dd', new Date());
      const age = differenceInYears(new Date(), birthdateObj);
      
      // 한국인은 만 19세 이상, 일본인은 만 18세 이상 가입 가능
      const minAge = countryCode === 'ko' ? 19 : 18;
      
      if (age < minAge) {
        setAgeError(
          countryCode === 'ko' 
            ? language === 'ko' 
              ? '한국인은 만 19세 이상만 가입할 수 있습니다.' 
              : '韓国人は満19歳以上のみ登録できます。'
            : language === 'ko' 
              ? '일본인은 만 18세 이상만 가입할 수 있습니다.' 
              : '日本人は満18歳以上のみ登録できます。'
        );
        return false;
      }
      
      setAgeError(null);
      return true;
    } catch (error) {
      console.error("Error validating age:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[BasicInfo] handleSubmit called', { name, birthdate, city, user });
    if (!name || !birthdate || !city || !user) {
      console.log('[BasicInfo] 필수값 누락', { name, birthdate, city, user });
      return;
    }
    // 나이 검증
    if (!validateAge(birthdate)) {
      console.log('[BasicInfo] 나이 검증 실패', { birthdate, countryCode });
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('[BasicInfo] DB 저장 시도');
      // DB 저장은 온보딩 마지막에만 하므로 여기서는 생략됨
      console.log('[BasicInfo] onComplete 호출');
      onComplete();
    } catch (error) {
      console.error('[BasicInfo] Error saving basic info:', error);
    } finally {
      setIsSubmitting(false);
      console.log('[BasicInfo] handleSubmit finally');
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
            onChange={(e) => {
              setBirthdate(e.target.value);
              if (e.target.value) validateAge(e.target.value);
            }}
            className="pasar-input"
            required
          />
          {ageError && (
            <p className="text-sm text-red-500 mt-1">{ageError}</p>
          )}
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
            disabled={!name || !birthdate || !city || isSubmitting || !!ageError}
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
