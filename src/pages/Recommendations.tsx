
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { RecommendationList } from "@/components/recommendation/RecommendationList";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Recommendations() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsLoading(false);
  }, [user, navigate]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          {language === "ko" ? "오늘의 추천" : "今日のおすすめ"}
        </h1>
        
        <RecommendationList />
      </div>
    </MainLayout>
  );
}
