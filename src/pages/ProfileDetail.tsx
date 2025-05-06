import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";
import { Heart, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { sendMatchRequest } from "@/utils/matchHelpers";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePhoto {
  url: string;
}

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch profile details
        const { data, error } = await supabase
          .from('users')
          .select(`
            id,
            nickname,
            birthdate,
            city,
            country_code,
            bio,
            gender,
            is_verified,
            profile_photos (
              id,
              url,
              sort_order
            ),
            user_interests (
              interest
            ),
            language_skills (
              language_code,
              proficiency
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        // Calculate age from birthdate
        const age = data.birthdate 
          ? Math.floor((new Date().getTime() - new Date(data.birthdate).getTime()) / 3.15576e+10)
          : null;
        
        // Sort photos by sort_order
        const sortedPhotos = data.profile_photos?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
        
        setProfile({
          ...data,
          age,
          photos: sortedPhotos,
          interests: data.user_interests?.map((i: any) => i.interest) || [],
          languages: data.language_skills || []
        });
        
        // Check if user has already liked this profile
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data: likeData, error: likeError } = await supabase
            .from('matches')
            .select('id')
            .eq('user_id', authData.user.id)
            .eq('target_user_id', id)
            .limit(1);
          
          if (!likeError && likeData && likeData.length > 0) {
            setIsLiked(true);
          }
        }
      } catch (error) {
        console.error("Error fetching profile details:", error);
        toast({
          title: language === "ko" ? "오류" : "エラー",
          description: language === "ko" ? "프로필 정보를 불러올 수 없습니다." : "プロフィール情報を読み込めません。",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileDetails();
  }, [id, toast, language]);

  const nextPhoto = () => {
    if (profile?.photos && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = async () => {
    if (!id || isLiked || isLiking) return;
    
    try {
      setIsLiking(true);
      await sendMatchRequest(id);
      setIsLiked(true);
      
      toast({
        title: language === "ko" ? "매칭 요청 보냄" : "マッチングリクエスト送信",
        description: language === "ko" ? "상대방이 수락하면 채팅이 가능해집니다." : "相手が承認するとチャットが可能になります。"
      });
    } catch (error) {
      console.error("Error sending match request:", error);
      toast({
        title: language === "ko" ? "오류" : "エラー",
        description: language === "ko" ? "매칭 요청을 보낼 수 없습니다." : "マッチングリクエストを送信できません。",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === "ko" ? "프로필을 찾을 수 없습니다" : "プロフィールが見つかりません"}
          </h1>
          <Button onClick={handleBack}>
            {language === "ko" ? "돌아가기" : "戻る"}
          </Button>
        </div>
      </MainLayout>
    );
  }

  const renderLanguageProficiency = (proficiency: string) => {
    switch (proficiency) {
      case 'native':
        return language === "ko" ? "원어민" : "ネイティブ";
      case 'fluent':
        return language === "ko" ? "유창함" : "流暢";
      case 'intermediate':
        return language === "ko" ? "중급" : "中級";
      case 'beginner':
        return language === "ko" ? "초급" : "初級";
      default:
        return proficiency;
    }
  };
  
  const getLanguageName = (code: string) => {
    const languages: Record<string, { ko: string; ja: string }> = {
      ko: { ko: "한국어", ja: "韓国語" },
      ja: { ko: "일본어", ja: "日本語" },
      en: { ko: "영어", ja: "英語" },
    };
    
    return languages[code]?.[language as 'ko' | 'ja'] || code;
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Photo Gallery */}
        <div className="relative h-[50vh] rounded-b-xl overflow-hidden mb-4">
          <img
            src={profile.photos[currentPhotoIndex]?.url || "/placeholder.svg"}
            alt={profile.nickname}
            className="w-full h-full object-cover"
          />
          
          <button 
            onClick={handleBack} 
            className="absolute top-4 left-4 bg-black/30 p-2 rounded-full text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Photo navigation */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {profile.photos.map((_: any, idx: number) => (
              <button 
                key={idx}
                onClick={() => setCurrentPhotoIndex(idx)}
                className={`w-2 h-2 rounded-full ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
          
          {currentPhotoIndex > 0 && (
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          
          {profile.photos && currentPhotoIndex < profile.photos.length - 1 && (
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="pasar-card p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.nickname}</h1>
                {profile.is_verified && (
                  <span className="text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">
                {profile.age && `${profile.age}세 · `}{profile.city}
              </p>
            </div>
            
            <Button
              onClick={handleLike}
              disabled={isLiked || isLiking}
              className={`rounded-full h-12 w-12 ${
                isLiked 
                  ? "bg-pink-100 text-pink-500 border border-pink-300 hover:bg-pink-200" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              <Heart
                className={`h-6 w-6 ${isLiked ? "fill-pink-500" : ""}`}
              />
            </Button>
          </div>
          
          {profile.bio && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">
                {language === "ko" ? "자기 소개" : "自己紹介"}
              </h2>
              <p>{profile.bio}</p>
            </div>
          )}
          
          <Separator className="my-6" />
          
          {/* Languages */}
          {profile.languages && profile.languages.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">
                {language === "ko" ? "언어" : "言語"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1">
                    {getLanguageName(lang.language_code)} - {renderLanguageProficiency(lang.proficiency)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">
                {language === "ko" ? "관심사" : "興味"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
