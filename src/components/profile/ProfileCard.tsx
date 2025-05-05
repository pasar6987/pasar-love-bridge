
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
  nationality?: string;
}

interface ProfileCardProps {
  profile: ProfileData;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { language } = useLanguage();
  
  // Labels for sections - these should be translated
  const aboutLabel = language === "ko" ? "소개" : "自己紹介";
  const detailsLabel = language === "ko" ? "정보" : "詳細";
  const jobLabel = language === "ko" ? "직업" : "職業";
  const educationLabel = language === "ko" ? "학력" : "学歴";
  const languagesLabel = language === "ko" ? "언어" : "言語";
  const interestsLabel = language === "ko" ? "관심사" : "興味";
  const koreanLabel = language === "ko" ? "한국어:" : "韓国語:";
  const japaneseLabel = language === "ko" ? "일본어:" : "日本語:";
  
  // Do not translate content - only UI elements
  const getEducationLabel = (edu: string): string => {
    // No translation toggle for profile content
    return edu;
  };
  
  const getLangProficiencyLabel = (level: string): string => {
    // No translation toggle for profile content
    return level;
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
              <h3 className="text-lg font-medium mb-2">{aboutLabel}</h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{detailsLabel}</h3>
              <dl className="divide-y divide-gray-100">
                <div className="py-2 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    {jobLabel}
                  </dt>
                  <dd className="text-sm text-gray-700 col-span-2">
                    {profile.job}
                  </dd>
                </div>
                
                <div className="py-2 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    {educationLabel}
                  </dt>
                  <dd className="text-sm text-gray-700 col-span-2">
                    {getEducationLabel(profile.education)}
                  </dd>
                </div>
                
                <div className="py-2 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">
                    {languagesLabel}
                  </dt>
                  <dd className="text-sm text-gray-700 col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="w-20">
                          {koreanLabel}
                        </span>
                        <span>{getLangProficiencyLabel(profile.languageSkills.korean)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20">
                          {japaneseLabel}
                        </span>
                        <span>{getLangProficiencyLabel(profile.languageSkills.japanese)}</span>
                      </div>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">{interestsLabel}</h3>
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
