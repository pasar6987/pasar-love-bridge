import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { sendMatchRequest } from "@/utils/matchHelpers";
import { Link } from "react-router-dom";

interface Photo {
  url: string;
}

interface RecommendationProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  bio: string;
  job?: string;
  photos: Photo[];
  isVerified?: boolean;
}

interface RecommendationCardProps {
  profile: RecommendationProfile;
  onLike: (id: string) => void;
  onPass?: (id: string) => void;
}

export function RecommendationCard({
  profile,
  onLike,
  onPass
}: RecommendationCardProps) {
  console.log("[RecommendationCard Debug] Rendering with profile:", JSON.stringify(profile));
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Safety check for profile
  if (!profile) {
    console.error("[RecommendationCard Debug] Profile is undefined");
    return (
      <div className="pasar-card w-full max-w-sm mx-auto p-4 text-center">
        <p>{language === "ko" ? "프로필 정보를 불러올 수 없습니다." : "プロフィール情報を読み込めません。"}</p>
      </div>
    );
  }

  // Safety check for photos array
  if (!profile.photos || !Array.isArray(profile.photos) || profile.photos.length === 0) {
    console.error("[RecommendationCard Debug] Photos array is invalid:", profile.photos);
    profile.photos = [{ url: "/placeholder.svg" }];
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLiked || isProcessing) return;
    
    try {
      setIsProcessing(true);
      await sendMatchRequest(profile.id);
      setIsLiked(true);
      onLike(profile.id);
      
      toast({
        title: language === "ko" ? "매칭 요청 보냄" : "マッチングリクエスト送信",
        description: language === "ko" ? "상대방이 수락하면 채팅이 가능해집니다." : "相手が承認するとチャットが可能になります。"
      });
    } catch (error) {
      console.error("[RecommendationCard Debug] Error sending match request:", error);
      toast({
        title: t("common.error"),
        description: t("common.tryAgain"),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePass = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPass) onPass(profile.id);
  };

  console.log("[RecommendationCard Debug] Current photo URL:", profile.photos[currentPhotoIndex]?.url);

  return (
    <Link to={`/profile/${profile.id}`}>
      <Card className="pasar-card w-full max-w-sm mx-auto overflow-hidden relative h-[500px]">
        <div className="relative w-full h-3/5 overflow-hidden">
          {/* Main photo */}
          <div className="w-full h-full relative">
            <img
              src={profile.photos[currentPhotoIndex]?.url || "/placeholder.svg"}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            
            {/* Photo navigation */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {profile.photos.map((_, idx) => (
                <span 
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>

            {/* Photo navigation buttons */}
            {currentPhotoIndex > 0 && (
              <button 
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/40 p-1 rounded-full"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
            )}
            
            {currentPhotoIndex < profile.photos.length - 1 && (
              <button 
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/40 p-1 rounded-full"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            )}
            
            {/* Photo thumbnails */}
            <div className="absolute top-2 right-2 flex gap-1">
              {profile.photos.slice(1, 3).map((photo, idx) => (
                <div 
                  key={idx} 
                  className="w-12 h-12 rounded-md overflow-hidden border-2 border-white cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentPhotoIndex(idx + 1);
                  }}
                >
                  <img 
                    src={photo.url} 
                    alt={`${profile.name} photo ${idx + 2}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 flex flex-col h-2/5">
          <div className="mb-2 flex items-center">
            <h3 className="text-xl font-semibold">{profile.name}, {profile.age}</h3>
            {profile.isVerified && (
              <span className="ml-1 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{profile.city}{profile.job ? ` · ${profile.job}` : ''}</p>
          <p className="text-sm mt-2 line-clamp-2 flex-grow">{profile.bio}</p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={handlePass}
              size="icon"
              variant="outline"
              className="rounded-full h-12 w-12"
            >
              <X className="h-6 w-6 text-gray-600" />
            </Button>
            <Button
              onClick={handleLike}
              size="icon"
              className={`rounded-full h-12 w-12 ${
                isLiked 
                  ? "bg-pink-100 text-pink-500 border border-pink-300 hover:bg-pink-200" 
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
              disabled={isLiked || isProcessing}
            >
              <Heart
                className={`h-6 w-6 ${isLiked ? "fill-pink-500" : ""}`}
              />
            </Button>
          </div>
          
          {isLiked && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 px-4 py-2 rounded-lg text-center">
                <Heart className="h-8 w-8 text-pink-500 fill-pink-500 mx-auto mb-2" />
                <p className="font-medium">
                  {language === "ko" ? "매칭 요청 보냄" : "リクエスト送信済み"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
