
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/context/LanguageContext";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockProfile = {
        id,
        name: id === "1" 
          ? (language === "ko" ? "하나코" : "花子")
          : id === "2"
          ? (language === "ko" ? "유카" : "ゆか")
          : (language === "ko" ? "마이" : "まい"),
        age: id === "1" ? 28 : id === "2" ? 25 : 27,
        location: id === "1" 
          ? (language === "ko" ? "도쿄" : "東京") 
          : id === "2" 
          ? (language === "ko" ? "오사카" : "大阪")
          : (language === "ko" ? "후쿠오카" : "福岡"),
        photos: [
          id === "1" 
            ? "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
            : id === "2"
            ? "https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
            : "https://images.unsplash.com/photo-1609132718484-cc90df3417f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
          "https://images.unsplash.com/photo-1557555187-23d685287bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
        ],
        bio: id === "1" 
          ? (language === "ko" ? "안녕하세요! 저는 일본 도쿄에 살고 있는 하나코입니다. 한국 문화와 K-Pop에 관심이 많습니다. 특히 BTS와 블랙핑크를 좋아해요. 한국에 몇 번 여행을 다녀왔고, 언젠가 더 오래 머물고 싶어요." : "こんにちは！東京に住んでいる花子です。韓国の文化とK-Popに興味があります。特にBTSとBLACKPINKが好きです。韓国に数回旅行に行ったことがあり、いつかもっと長く滞在したいです。")
          : id === "2"
          ? (language === "ko" ? "오사카에서 카페를 운영하고 있어요. 취미는 여행과 사진 찍기입니다. 한국어를 배우고 있어요! 한국의 커피 문화를 좋아하고, 언젠가 서울에서도 카페를 열고 싶어요." : "大阪でカフェを経営しています。趣味は旅行と写真撮影です。韓国語を勉強中です！韓国のコーヒー文化が好きで、いつかソウルでもカフェをオープンしたいです。")
          : (language === "ko" ? "음악을 사랑하는 선생님입니다. 한국 드라마를 좋아해서 한국어를 독학하고 있어요. 최근에는 피아노를 배우기 시작했어요." : "音楽を愛する教師です。韓国ドラマが好きで、韓国語を独学で勉強しています。最近はピアノを習い始めました。"),
        job: id === "1" 
          ? (language === "ko" ? "디자이너" : "デザイナー") 
          : id === "2" 
          ? (language === "ko" ? "카페 운영자" : "カフェオーナー")
          : (language === "ko" ? "교사" : "教師"),
        education: "bachelors",
        interests: id === "1"
          ? (language === "ko" ? ["음악", "영화", "여행", "요리"] : ["音楽", "映画", "旅行", "料理"])
          : id === "2"
          ? (language === "ko" ? ["사진", "커피", "독서", "패션"] : ["写真", "コーヒー", "読書", "ファッション"])
          : (language === "ko" ? ["음악", "댄스", "언어 교환", "영화"] : ["音楽", "ダンス", "言語交換", "映画"]),
        languageSkills: {
          korean: id === "1" ? "beginner" : id === "2" ? "intermediate" : "beginner",
          japanese: "native",
          english: "intermediate"
        },
        verified: true,
      };
      setProfile(mockProfile);
      setLoading(false);
    }, 1000);
  }, [id, language]);

  const handleSendMatchRequest = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({
        title: language === "ko" ? "매칭 요청 전송 완료" : "マッチングリクエスト送信完了",
        description: language === "ko" 
          ? "상대방이 요청을 검토하면 알림을 보내드릴게요"
          : "相手がリクエストを確認次第、お知らせします",
      });
      navigate("/matches");
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 mr-1"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {language === "ko" ? "뒤로 가기" : "戻る"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <ProfileCard profile={profile} />
            
            <div className="flex justify-center mt-8">
              <Button
                className="pasar-btn"
                onClick={handleSendMatchRequest}
                disabled={sending}
              >
                {sending ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></span>
                    {language === "ko" ? "전송 중..." : "送信中..."}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Heart className="mr-2 h-5 w-5" />
                    {language === "ko" ? "매칭 요청하기" : "マッチングをリクエストする"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === "ko" ? "프로필을 찾을 수 없습니다" : "プロフィールが見つかりません"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
