
import { useState, useEffect } from "react";
import { RecommendationCard } from "@/components/recommendation/RecommendationCard";
import { getDailyRecommendations } from "@/utils/matchHelpers";
import { useLanguage } from "@/i18n/useLanguage";
import { useToast } from "@/hooks/use-toast";

// Interface for the profile data received from the API
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

// Interface matching what RecommendationCard expects
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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        console.log("[RecommendationList Debug] Loading recommendations");
        setLoading(true);
        const recommendations = await getDailyRecommendations();
        
        console.log("[RecommendationList Debug] Recommendations data received:", JSON.stringify(recommendations));
        
        // Ensure recommendations is an array before setting state
        if (Array.isArray(recommendations)) {
          console.log("[RecommendationList Debug] Valid array of recommendations, length:", recommendations.length);
          setProfiles(recommendations);
        } else {
          console.error("[RecommendationList Debug] Recommendations is not an array:", recommendations);
          setProfiles([]);
          setError("No recommendations available");
        }
      } catch (error) {
        console.error("[RecommendationList Debug] Error loading recommendations:", error);
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
    console.log("[RecommendationList Debug] Like clicked for profile:", id);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more profiles
      setProfiles([]);
    }
  };

  const handlePass = (id: string) => {
    console.log("[RecommendationList Debug] Pass clicked for profile:", id);
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // No more profiles
      setProfiles([]);
    }
  };

  console.log("[RecommendationList Debug] Render state:", { 
    loading, 
    error, 
    profileCount: profiles.length,
    currentIndex,
    hasCurrentProfile: currentIndex < profiles.length && !!profiles[currentIndex]
  });

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

  // Safety check for array bounds
  if (currentIndex >= profiles.length) {
    console.error("[RecommendationList Debug] Current index out of bounds:", { currentIndex, profilesLength: profiles.length });
    return (
      <div className="text-center py-4">
        {language === "ko" ? "추천 프로필이 더 이상 없습니다." : "おすすめのプロフィールはこれ以上ありません。"}
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  
  // Safety check for currentProfile before rendering
  if (!currentProfile) {
    console.error("[RecommendationList Debug] Current profile is undefined:", { currentIndex, profiles });
    return (
      <div className="text-center py-4">
        {language === "ko" ? "추천 프로필이 더 이상 없습니다." : "おすすめのプロフィールはこれ以上ありません。"}
      </div>
    );
  }

  // Convert Profile to RecommendationProfile format
  console.log("[RecommendationList Debug] Converting profile:", currentProfile);
  const mappedProfile: RecommendationProfile = {
    id: currentProfile.id,
    name: currentProfile.name,
    age: currentProfile.age,
    city: currentProfile.location, // Map location to city
    bio: currentProfile.bio,
    job: currentProfile.job,
    photos: [{ url: currentProfile.photo }], // Convert single photo to photos array
    isVerified: false // Default value
  };
  console.log("[RecommendationList Debug] Mapped profile:", mappedProfile);

  return (
    <div>
      <RecommendationCard
        profile={mappedProfile}
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
