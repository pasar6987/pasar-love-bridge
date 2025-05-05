
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileGrid } from "@/components/home/ProfileGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter profiles based on user's nationality
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      
      try {
        // Get user's auth data
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Get user's nationality from user_nationalities table
        const { data: userNationalityData, error: nationalityError } = await supabase
          .from('user_nationalities')
          .select('nationality')
          .eq('user_id', user.id)
          .single();
          
        if (nationalityError) {
          console.error("Error fetching user nationality:", nationalityError);
          // Fallback to language-based nationality
          const userNationality = language === 'ko' ? 'ko' : 'ja';
          fetchProfilesByNationality(userNationality);
        } else {
          const userNationality = userNationalityData?.nationality || (language === 'ko' ? 'ko' : 'ja');
          fetchProfilesByNationality(userNationality);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setLoading(false);
      }
    };

    const fetchProfilesByNationality = (userNationality: string) => {
      // For demo, use mock data filtered by opposite nationality
      setTimeout(() => {
        const mockData = [
          {
            id: "1",
            name: "花子",
            age: 28,
            location: "東京",
            photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            bio: "こんにちは！東京に住んでいる花子です。韓国の文化とK-Popに興味があります。",
            job: "デザイナー",
            nationality: "ja",
          },
          {
            id: "2",
            name: "ゆか",
            age: 25,
            location: "大阪",
            photo: "https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            bio: "大阪でカフェを経営しています。趣味は旅行と写真撮影です。韓国語を勉強中です！",
            job: "カフェオーナー",
            nationality: "ja",
          },
          {
            id: "3",
            name: "まい",
            age: 27,
            location: "福岡",
            photo: "https://images.unsplash.com/photo-1609132718484-cc90df3417f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            bio: "音楽を愛する教師です。韓国ドラマが好きで、韓国語を独学で勉強しています。",
            job: "教師",
            nationality: "ja",
          },
          {
            id: "4",
            name: "민수",
            age: 29,
            location: "서울",
            photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a29yZWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            bio: "안녕하세요! 서울에 사는 민수입니다. 일본 문화와 음식에 관심이 많아요.",
            job: "프로그래머",
            nationality: "ko",
          },
          {
            id: "5",
            name: "준호",
            age: 27,
            location: "부산",
            photo: "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXNpYW4lMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            bio: "부산에서 근무하는 의사입니다. 일본어 공부 중이며 일본 여행을 좋아해요!",
            job: "의사",
            nationality: "ko",
          }
        ];

        // Filter based on user nationality
        let filteredData;
        if (userNationality === 'ko') {
          // Korean users see Japanese profiles only
          filteredData = mockData.filter(profile => profile.nationality === 'ja');
        } else {
          // Japanese users see Korean profiles only
          filteredData = mockData.filter(profile => profile.nationality === 'ko');
        }
        
        setRecommendations(filteredData);
        setLoading(false);
      }, 1000);
    };

    fetchProfiles();
  }, [language, navigate]);

  const handleLike = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      // In a real app, we would insert into the matches table
      // Here we're just simulating it
      console.log(`User ${user.id} liked profile ${id}`);
      
      // For demo purposes, we'll remove the liked profile from recommendations
      setRecommendations(prev => prev.filter(profile => profile.id !== id));
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          {t("home.recommendations")}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <ProfileGrid profiles={recommendations} onLike={handleLike} />
        ) : (
          <div className="pasar-card max-w-lg mx-auto p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-pink/20 flex items-center justify-center">
              <img 
                src="/lovable-uploads/6bdd8a27-cd91-4f69-bda2-2afe0a4a0cdd.png" 
                alt="Pasar" 
                className="h-12 w-12"
              />
            </div>
            <h3 className="text-xl font-medium mb-3">{t("home.noMore")}</h3>
            <p className="text-muted-foreground mb-6">
              {language === "ko"
                ? "다른 매칭을 확인하거나 프로필을 업데이트해보세요."
                : "他のマッチングを確認するか、プロフィールを更新してみてください。"}
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate("/matches")}
              >
                {t("nav.matches")}
              </Button>
              <Button
                className="pasar-btn"
                onClick={() => navigate("/mypage")}
              >
                {t("nav.profile")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
