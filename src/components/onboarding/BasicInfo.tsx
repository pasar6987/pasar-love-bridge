
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

interface BasicInfoProps {
  onComplete: () => void;
}

export function BasicInfo({ onComplete }: BasicInfoProps) {
  const { t, language } = useLanguage();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [birthdate, setBirthdate] = useState("");
  const [nationality, setNationality] = useState(language === "ko" ? "KR" : "JP");
  const [city, setCity] = useState("");
  
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
      
      <form className="space-y-4">
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
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium">
            {t("onboarding.basics.gender")}
          </label>
          <Select value={gender} onValueChange={setGender}>
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
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="nationality" className="text-sm font-medium">
            {t("onboarding.basics.nationality")}
          </label>
          <Select value={nationality} onValueChange={setNationality}>
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
          />
        </div>
      </form>
      
      <div className="flex justify-end mt-8">
        <Button
          onClick={onComplete}
          className="pasar-btn"
          disabled={!name || !birthdate || !city}
        >
          {t("action.next")}
        </Button>
      </div>
    </div>
  );
}
