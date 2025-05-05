import { useLanguage } from "@/i18n/useLanguage";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  bio: string;
  job: string;
  education: string;
  interests: string[];
  languageSkills: Record<string, string>;
  verified: boolean;
}

interface ProfileCardProps {
  profile: ProfileData;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { t, language } = useLanguage();
  
  const getEducationLabel = (edu: string): string => {
    if (language === "ko") {
      switch (edu) {
        case "high_school": return "고등학교 졸업";
        case "bachelors": return "학사";
        case "masters": return "석사";
        case "phd": return "박사";
        default: return edu;
      }
    } else {
      switch (edu) {
        case "high_school": return "高校卒業";
        case "bachelors": return "学士";
        case "masters": return "修士";
        case "phd": return "博士";
        default: return edu;
      }
    }
  };
  
  const getLangProficiencyLabel = (level: string): string => {
    if (language === "ko") {
      switch (level) {
        case "none": return "못함";
        case "beginner": return "초급";
        case "intermediate": return "중급";
        case "advanced": return "고급";
        case "native": return "원어민";
        default: return level;
      }
    } else {
      switch (level) {
        case "none": return "できない";
        case "beginner": return "初級";
        case "intermediate": return "中級";
        case "advanced": return "上級";
        case "native": return "ネイティブ";
        default: return level;
      }
    }
  };
  
  return (
    <div className="pasar-card max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-full md:w-1/3">
          <div className="aspect-square rounded-xl overflow-hidden">
            <img
              src={profile.photos[0]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {profile.photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {profile.photos.slice(1, 4).map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`${profile.name} ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold flex items-center">
                {profile.name}, {profile.age}
                {profile.verified && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 py-0.5 px-1.5 rounded-md">
                    {language === "ko" ? "인증됨" : "認証済み"}
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground">{profile.location}</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">{t("profile.about")}</h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t("profile.details")}</h3>
              <dl className="divide-y divide-gray-100">
                <div className="py-2 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    {t("onboarding.questions.job")}
                  </dt>
                  <dd className="text-sm text-gray-700 col-span-2">
                    {profile.job}
                  </dd>
                </div>
                
                <div className="py-2 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    {t("onboarding.questions.education")}
                  </dt>
                  <dd className="text-sm text-gray-700 col-span-2">
                    {getEducationLabel(profile.education)}
                  </dd>
                </div>
                
                <div className="py-2 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    {t("onboarding.questions.languages")}
                  </dt>
                  <dd className="text-sm text-gray-700 col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="w-20">
                          {language === "ko" ? "한국어:" : "韓国語:"}
                        </span>
                        <span>{getLangProficiencyLabel(profile.languageSkills.korean)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20">
                          {language === "ko" ? "일본어:" : "日本語:"}
                        </span>
                        <span>{getLangProficiencyLabel(profile.languageSkills.japanese)}</span>
                      </div>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{t("onboarding.questions.interests")}</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="bg-pastel-lavender/30 text-gray-700">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
