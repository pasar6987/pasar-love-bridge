
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface QuestionsProps {
  onComplete: () => void;
  tempData: {
    job: string;
    education: string;
    bio: string;
    interests: string[];
    koreanLevel: string;
    japaneseLevel: string;
  };
  updateTempData: (value: {
    job: string;
    education: string;
    bio: string;
    interests: string[];
    koreanLevel: string;
    japaneseLevel: string;
  }) => void;
}

export function Questions({ onComplete, tempData, updateTempData }: QuestionsProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState(tempData.job || "");
  const [education, setEducation] = useState(tempData.education || "");
  const [bio, setBio] = useState(tempData.bio || "");
  const [interests, setInterests] = useState<string[]>(tempData.interests || []);
  const [koreanLevel, setKoreanLevel] = useState(tempData.koreanLevel || (language === "ko" ? "native" : "beginner"));
  const [japaneseLevel, setJapaneseLevel] = useState(tempData.japaneseLevel || (language === "ko" ? "beginner" : "native"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 임시 데이터 업데이트
  useEffect(() => {
    updateTempData({
      job,
      education,
      bio,
      interests,
      koreanLevel,
      japaneseLevel
    });
  }, [job, education, bio, interests, koreanLevel, japaneseLevel, updateTempData]);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update user bio
      const { error: bioError } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', user.id);
      
      if (bioError) throw bioError;
      
      // Save interests
      if (interests.length > 0) {
        const interestsData = interests.map(interest => ({
          user_id: user.id,
          interest
        }));
        
        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interestsData);
        
        if (interestsError) throw interestsError;
      }
      
      // Save language skills
      const languageData = [
        {
          user_id: user.id,
          language_code: "korean",
          proficiency: koreanLevel
        },
        {
          user_id: user.id,
          language_code: "japanese",
          proficiency: japaneseLevel
        }
      ];
      
      const { error: languageError } = await supabase
        .from('language_skills')
        .insert(languageData);
      
      if (languageError) throw languageError;
      
      onComplete();
    } catch (error) {
      console.error("Error saving profile data:", error);
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
          {t("onboarding.questions.title")}
        </h2>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
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
              <Select value={koreanLevel} onValueChange={setKoreanLevel}>
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
              <Select value={japaneseLevel} onValueChange={setJapaneseLevel}>
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
        
        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            className="pasar-btn"
            disabled={isSubmitting}
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
