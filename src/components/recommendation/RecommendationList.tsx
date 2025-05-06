
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/useLanguage";
import { RecommendationCard } from "./RecommendationCard";
import { getDailyRecommendations } from "@/utils/matchHelpers";
import { useToast } from "@/hooks/use-toast";

export function RecommendationList() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDailyRecommendations();
        
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else {
          console.error("Invalid recommendation data format:", data);
          setRecommendations([]);
          setError("데이터 형식 오류");
          toast({
            title: language === "ko" ? "데이터 로딩 오류" : "データ読み込みエラー",
            description: language === "ko" ? "추천 데이터를 가져오지 못했습니다." : "おすすめデータを取得できませんでした。",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
        setError("데이터 로딩 오류");
        toast({
          title: language === "ko" ? "오류 발생" : "エラーが発生しました",
          description: language === "ko" ? "추천 목록을 불러오는 중 오류가 발생했습니다." : "おすすめリストの読み込み中にエラーが発生しました。",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [language, toast]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-red-500 mb-4">
          {language === "ko" ? "오류가 발생했습니다" : "エラーが発生しました"}
        </p>
        <p className="text-muted-foreground">
          {language === "ko" ? "잠시 후 다시 시도해주세요." : "しばらくしてからもう一度お試しください。"}
        </p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-muted-foreground">
          {language === "ko"
            ? "오늘의 추천 프로필이 없습니다. 내일 다시 확인해보세요!"
            : "今日のおすすめプロフィールはありません。また明日確認してください！"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {recommendations.map((profile) => (
        <RecommendationCard 
          key={profile.id} 
          profile={profile} 
          onLike={(id) => console.log('Liked:', id)} 
          onPass={(id) => console.log('Passed:', id)}
        />
      ))}
    </div>
  );
}

export default RecommendationList;
