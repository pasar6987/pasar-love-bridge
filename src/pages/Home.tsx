
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProfileGrid } from "@/components/home/ProfileGrid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch recommendations based on user's nationality
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Call the RPC function we created to get recommended profiles
        const { data, error } = await supabase.rpc(
          'get_recommended_profiles_by_nationality',
          { p_user_id: user.id }
        );
        
        if (error) {
          console.error("Error fetching recommendations:", error);
          setLoading(false);
          return;
        }
        
        setRecommendations(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [language, navigate, user]);

  const handleLike = async (id: string) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Use the RPC function to handle likes
      const { error } = await supabase.rpc(
        'handle_user_like',
        { 
          p_user_id: user.id,
          p_target_profile_id: id 
        }
      );
      
      if (error) {
        throw error;
      }
      
      // Remove the liked profile from recommendations
      setRecommendations(prev => prev.filter(profile => profile.id !== id));
      
      toast({
        title: t("matches.likeSent"),
        description: t("matches.likeDescription"),
      });
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
