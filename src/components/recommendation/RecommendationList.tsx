
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/useLanguage";
import RecommendationCard from "./RecommendationCard";
import { getDailyRecommendations } from "@/utils/matchHelpers";

export function RecommendationList() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const data = await getDailyRecommendations();
        setRecommendations(data);
      } catch (error) {
        console.error("Error loading recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
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
        <RecommendationCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

export default RecommendationList;
