
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/i18n/useLanguage";

interface ProfileBasicInfoProps {
  nickname: string | null;
  birthdate: string | null;
  gender: string | null;
  city: string | null;
  countryCode: string | null;
  nationality: string | null;
}

export function ProfileBasicInfo({
  nickname,
  birthdate,
  gender,
  city,
  countryCode,
  nationality
}: ProfileBasicInfoProps) {
  const { language } = useLanguage();
  
  // Calculate age from birthdate
  const getAge = (birthdate: string | null) => {
    if (!birthdate) return null;
    
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const age = birthdate ? getAge(birthdate) : null;
  
  // Format gender text
  const formatGender = (gender: string | null) => {
    if (!gender) return null;
    
    if (language === "ko") {
      return gender === "male" ? "남성" : gender === "female" ? "여성" : gender;
    } else {
      return gender === "male" ? "男性" : gender === "female" ? "女性" : gender;
    }
  };
  
  // Format nationality
  const formatNationality = (nationality: string | null) => {
    if (!nationality) return null;
    
    return nationality === "ko" ? 
      (language === "ko" ? "한국" : "韓国") : 
      nationality === "ja" ? 
        (language === "ko" ? "일본" : "日本") : 
        nationality;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {language === "ko" ? "기본 정보" : "基本情報"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-y-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "닉네임" : "ニックネーム"}
          </h3>
          <p>{nickname || "-"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "나이" : "年齢"}
          </h3>
          <p>{age ? `${age}${language === "ko" ? "세" : "歳"}` : "-"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "성별" : "性別"}
          </h3>
          <p>{formatGender(gender) || "-"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "국적" : "国籍"}
          </h3>
          <p>{formatNationality(nationality) || "-"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "도시" : "都市"}
          </h3>
          <p>{city || "-"}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {language === "ko" ? "국가 코드" : "国コード"}
          </h3>
          <p>{countryCode ? countryCode.toUpperCase() : "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
