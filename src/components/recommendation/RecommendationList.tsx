
import { useState, useEffect } from "react";
import { RecommendationCard } from "./RecommendationCard";
import { useLanguage } from "@/i18n/useLanguage";
import { fetchDailyRecommendations } from "@/utils/matchHelpers";
import { useToast } from "@/hooks/use-toast";

interface RecommendationProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  job?: string;
  photos: { url: string }[];
  isVerified?: boolean;
}

export function RecommendationList() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        const data = await fetchDailyRecommendations();
        
        // Transform the data into our component format
        const formattedData = data.map((profile: any) => ({
          id: profile.id,
          name: profile.nickname || profile.name,
          age: profile.age,
          city: profile.city,
          bio: profile.bio || "",
          job: profile.job,
          photos: profile.photos || [],
          isVerified: profile.is_verified
        }));
        
        setRecommendations(formattedData);
      } catch (error) {
        console.error("Error loading recommendations:", error);
        toast({
          title: t("common.error"),
          description: t("common.tryAgain"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadRecommendations();
  }, [t, toast]);

  const handleLike = (id: string) => {
    // Remove the liked profile from recommendations
    setRecommendations(prev => prev.filter(profile => profile.id !== id));
  };

  const handlePass = (id: string) => {
    // Remove the passed profile from recommendations
    setRecommendations(prev => prev.filter(profile => profile.id !== id));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <div className="pasar-card max-w-lg mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-pink/20 flex items-center justify-center">
          <img 
            src="/lovable-uploads/6bdd8a27-cd91-4f69-bda2-2afe0a4a0cdd.png" 
            alt="Pasar" 
            className="h-12 w-12"
          />
        </div>
        <h3 className="text-xl font-medium mb-3">{language === "ko" ? "오늘의 추천이 없습니다" : "今日のおすすめはありません"}</h3>
        <p className="text-muted-foreground mb-6">
          {language === "ko"
            ? "내일 새로운 추천을 확인해보세요!"
            : "明日の新しいおすすめをお楽しみに！"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {recommendations.map((profile) => (
        <RecommendationCard
          key={profile.id}
          profile={profile}
          onLike={handleLike}
          onPass={handlePass}
        />
      ))}
    </div>
  );
}
