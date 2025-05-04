
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface QuestionsProps {
  onComplete: () => void;
}

export function Questions({ onComplete }: QuestionsProps) {
  const { t, language } = useLanguage();
  const [job, setJob] = useState("");
  const [education, setEducation] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  
  const availableInterests = {
    ko: [
      "영화", "음악", "여행", "독서", "요리", "운동", "패션", "게임", "언어 교환", 
      "사진", "미술", "테크놀로지", "댄스", "명상", "자연", "음식", "동물"
    ],
    ja: [
      "映画", "音楽", "旅行", "読書", "料理", "スポーツ", "ファッション", "ゲーム", "言語交換", 
      "写真", "美術", "テクノロジー", "ダンス", "瞑想", "自然", "食べ物", "動物"
    ]
  };
  
  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {t("onboarding.questions.title")}
        </h2>
      </div>
      
      <form className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="job" className="text-sm font-medium">
            {t("onboarding.questions.job")}
          </label>
          <Input
            id="job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="pasar-input"
            placeholder={language === "ko" ? "직업을 입력하세요" : "職業を入力してください"}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="education" className="text-sm font-medium">
            {t("onboarding.questions.education")}
          </label>
          <Select value={education} onValueChange={setEducation}>
            <SelectTrigger className="pasar-input">
              <SelectValue placeholder={language === "ko" ? "학력 선택" : "学歴を選択"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high_school">
                {language === "ko" ? "고등학교 졸업" : "高校卒業"}
              </SelectItem>
              <SelectItem value="bachelors">
                {language === "ko" ? "학사" : "学士"}
              </SelectItem>
              <SelectItem value="masters">
                {language === "ko" ? "석사" : "修士"}
              </SelectItem>
              <SelectItem value="phd">
                {language === "ko" ? "박사" : "博士"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            {t("profile.about")}
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="pasar-input min-h-[100px]"
            placeholder={language === "ko" ? "자기소개를 작성해주세요" : "自己紹介を書いてください"}
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-sm font-medium">
            {t("onboarding.questions.interests")}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableInterests[language].map((interest) => (
              <label
                key={interest}
                className={`px-3 py-2 rounded-full text-sm cursor-pointer transition-colors
                ${
                  interests.includes(interest)
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={interests.includes(interest)}
                    onCheckedChange={() => toggleInterest(interest)}
                    className="hidden"
                  />
                  <span>{interest}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="languages" className="text-sm font-medium">
            {t("onboarding.questions.languages")}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {language === "ko" ? "한국어" : "韓国語"}
              </p>
              <Select defaultValue="native">
                <SelectTrigger className="pasar-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {language === "ko" ? "못함" : "できない"}
                  </SelectItem>
                  <SelectItem value="beginner">
                    {language === "ko" ? "초급" : "初級"}
                  </SelectItem>
                  <SelectItem value="intermediate">
                    {language === "ko" ? "중급" : "中級"}
                  </SelectItem>
                  <SelectItem value="advanced">
                    {language === "ko" ? "고급" : "上級"}
                  </SelectItem>
                  <SelectItem value="native">
                    {language === "ko" ? "원어민" : "ネイティブ"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {language === "ko" ? "일본어" : "日本語"}
              </p>
              <Select defaultValue={language === "ko" ? "beginner" : "native"}>
                <SelectTrigger className="pasar-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {language === "ko" ? "못함" : "できない"}
                  </SelectItem>
                  <SelectItem value="beginner">
                    {language === "ko" ? "초급" : "初級"}
                  </SelectItem>
                  <SelectItem value="intermediate">
                    {language === "ko" ? "중급" : "中級"}
                  </SelectItem>
                  <SelectItem value="advanced">
                    {language === "ko" ? "고급" : "上級"}
                  </SelectItem>
                  <SelectItem value="native">
                    {language === "ko" ? "원어민" : "ネイティブ"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>
      
      <div className="flex justify-end mt-8">
        <Button
          onClick={onComplete}
          className="pasar-btn"
        >
          {t("action.next")}
        </Button>
      </div>
    </div>
  );
}
