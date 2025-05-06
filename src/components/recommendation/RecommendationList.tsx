
import { useState, useEffect } from "react";
import { RecommendationCard } from "@/components/recommendation/RecommendationCard";
import { getDailyRecommendations } from "@/utils/matchHelpers";
import { useLanguage } from "@/i18n/useLanguage";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  photo: string;
  bio: string;
  job: string;
  nationality?: string;
}

export function RecommendationList() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const recommendations = await getDailyRecommendations();
        
        // Ensure recommendations is an array before setting state
        if (Array.isArray(recommendations)) {
          setProfiles(recommendations);
        } else {
          console.error("Recommendations is not an array:", recommendations);
          setProfiles([]);
          setError("No recommendations available");
        }
      } catch (error) {
        console.error("Error loading recommendations:", error);
        setError("Error loading recommendations");
        toast({
          title: language === "ko" ? "추천 목록을 불러오는데 실패했습니다" : "おすすめリストの読み込みに失敗しました",
          description: language === "ko" ? "나중에 다시 시도해주세요" : "後でもう一度お試しください",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [toast, language]);

  const handleLike = (id: string) => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more profiles
      setProfiles([]);
    }
  };

  const handlePass = (id: string) => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more profiles
      setProfiles([]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || profiles.length === 0) {
    return (
      <div className="pasar-card max-w-lg mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-pink/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9 16h6v-2a3 3 0 00-6 0v2z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-3">
          {language === "ko" ? "오늘의 추천이 없습니다" : "今日のおすすめはありません"}
        </h3>
        <p className="text-muted-foreground">
          {language === "ko" ? "내일 다시 확인해보세요!" : "また明日確認してください！"}
        </p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  
  // Safety check for currentProfile before rendering
  if (!currentProfile) {
    return (
      <div className="text-center py-4">
        {language === "ko" ? "추천 프로필이 더 이상 없습니다." : "おすすめのプロフィールはこれ以上ありません。"}
      </div>
    );
  }

  return (
    <div>
      <RecommendationCard
        profile={currentProfile}
        onLike={handleLike}
        onPass={handlePass}
      />
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {language === "ko" 
          ? `${currentIndex + 1}/${profiles.length} 프로필` 
          : `${currentIndex + 1}/${profiles.length} プロフィール`}
      </div>
    </div>
  );
}
