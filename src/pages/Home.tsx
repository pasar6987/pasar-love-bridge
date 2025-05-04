
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/context/LanguageContext";
import { RecommendationCard } from "@/components/home/RecommendationCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Home() {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockData = [
        {
          id: "1",
          name: language === "ko" ? "하나코" : "花子",
          age: 28,
          location: language === "ko" ? "도쿄" : "東京",
          photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
          bio: language === "ko" ? "안녕하세요! 저는 일본 도쿄에 살고 있는 하나코입니다. 한국 문화와 K-Pop에 관심이 많습니다." : "こんにちは！東京に住んでいる花子です。韓国の文化とK-Popに興味があります。",
          job: language === "ko" ? "디자이너" : "デザイナー",
        },
        {
          id: "2",
          name: language === "ko" ? "유카" : "ゆか",
          age: 25,
          location: language === "ko" ? "오사카" : "大阪",
          photo: "https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
          bio: language === "ko" ? "오사카에서 카페를 운영하고 있어요. 취미는 여행과 사진 찍기입니다. 한국어를 배우고 있어요!" : "大阪でカフェを経営しています。趣味は旅行と写真撮影です。韓国語を勉強中です！",
          job: language === "ko" ? "카페 운영자" : "カフェオーナー",
        },
        {
          id: "3",
          name: language === "ko" ? "마이" : "まい",
          age: 27,
          location: language === "ko" ? "후쿠오카" : "福岡",
          photo: "https://images.unsplash.com/photo-1609132718484-cc90df3417f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
          bio: language === "ko" ? "음악을 사랑하는 선생님입니다. 한국 드라마를 좋아해서 한국어를 독학하고 있어요." : "音楽を愛する教師です。韓国ドラマが好きで、韓国語を独学で勉強しています。",
          job: language === "ko" ? "교사" : "教師",
        }
      ];
      setRecommendations(mockData);
      setLoading(false);
    }, 1000);
  }, [language]);

  const handleLike = (id: string) => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more recommendations
    }
  };

  const handlePass = (id: string) => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more recommendations
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          {t("home.recommendations")}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : currentIndex < recommendations.length ? (
          <RecommendationCard
            profile={recommendations[currentIndex]}
            onLike={handleLike}
            onPass={handlePass}
          />
        ) : (
          <div className="pasar-card max-w-lg mx-auto p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-pink/20 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
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
                onClick={() => navigate("/profile")}
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
