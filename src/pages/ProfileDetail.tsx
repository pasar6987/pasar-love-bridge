
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock data - now with nationality field
  useEffect(() => {
    setTimeout(() => {
      // Japanese profiles
      const japaneseProfiles = {
        "1": {
          id: "1",
          name: "花子",
          age: 28,
          location: "東京",
          photos: [
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1557555187-23d685287bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
          ],
          bio: "こんにちは！東京に住んでいる花子です。韓国の文化とK-Popに興味があります。特にBTSとBLACKPINKが好きです。韓国に数回旅行に行ったことがあり、いつかもっと長く滞在したいです。",
          job: "デザイナー",
          education: "bachelors",
          interests: ["音楽", "映画", "旅行", "料理"],
          languageSkills: {
            korean: "beginner",
            japanese: "native",
            english: "intermediate"
          },
          verified: true,
          nationality: "ja"
        },
        "2": {
          id: "2",
          name: "ゆか",
          age: 25,
          location: "大阪",
          photos: [
            "https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1557555187-23d685287bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
          ],
          bio: "大阪でカフェを経営しています。趣味は旅行と写真撮影です。韓国語を勉強中です！韓国のコーヒー文化が好きで、いつかソウルでもカフェをオープンしたいです。",
          job: "カフェオーナー",
          education: "bachelors",
          interests: ["写真", "コーヒー", "読書", "ファッション"],
          languageSkills: {
            korean: "intermediate",
            japanese: "native",
            english: "intermediate"
          },
          verified: true,
          nationality: "ja"
        },
        "3": {
          id: "3",
          name: "まい",
          age: 27,
          location: "福岡",
          photos: [
            "https://images.unsplash.com/photo-1609132718484-cc90df3417f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1557555187-23d685287bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBvcnRyYWl0JTIwYXNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
          ],
          bio: "音楽を愛する教師です。韓国ドラマが好きで、韓国語を独学で勉強しています。最近はピアノを習い始めました。",
          job: "教師",
          education: "masters",
          interests: ["音楽", "ダンス", "言語交換", "映画"],
          languageSkills: {
            korean: "beginner",
            japanese: "native",
            english: "intermediate"
          },
          verified: true,
          nationality: "ja"
        }
      };
      
      // Korean profiles
      const koreanProfiles = {
        "4": {
          id: "4",
          name: "민수",
          age: 29,
          location: "서울",
          photos: [
            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a29yZWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXNpYW4lMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cG9ydHJhaXQlMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
          ],
          bio: "안녕하세요! 서울에 사는 민수입니다. 일본 문화와 음식에 관심이 많아요. 특히 일본 애니메이션과 라멘을 좋아합니다. 도쿄에 여행 가본 적이 있고 언젠가 일본에서 살고 싶어요.",
          job: "프로그래머",
          education: "masters",
          interests: ["애니메이션", "음식", "여행", "기술"],
          languageSkills: {
            korean: "native",
            japanese: "beginner",
            english: "advanced"
          },
          verified: true,
          nationality: "ko"
        },
        "5": {
          id: "5",
          name: "준호",
          age: 27,
          location: "부산",
          photos: [
            "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXNpYW4lMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a29yZWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cG9ydHJhaXQlMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60"
          ],
          bio: "부산에서 근무하는 의사입니다. 일본어 공부 중이며 일본 여행을 좋아해요! 오사카를 특히 좋아하고 일본 의료 시스템에 관심이 많습니다.",
          job: "의사",
          education: "phd",
          interests: ["의학", "언어 학습", "요리", "등산"],
          languageSkills: {
            korean: "native",
            japanese: "intermediate",
            english: "advanced"
          },
          verified: true,
          nationality: "ko"
        }
      };
      
      // Determine which profile to show based on ID and user language
      let selectedProfile = null;
      
      if (id && language === 'ko') {
        // Korean users see Japanese profiles (ids 1-3)
        selectedProfile = japaneseProfiles[id];
      } else if (id && language === 'ja') {
        // Japanese users see Korean profiles (ids 4-5)
        selectedProfile = koreanProfiles[id];
      }
      
      setProfile(selectedProfile);
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
