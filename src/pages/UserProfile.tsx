
import React, { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/useLanguage";
import ProfilePhotoGrid from "@/components/ProfilePhotoGrid";
import { useUploadPhotos } from "@/hooks/useUploadPhotos";

export default function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const [userPhotos, setUserPhotos] = useState<string[]>([]);
  const { 
    photos, 
    isUploading, 
    updateProfilePhoto,
    removePhoto,
    isPendingApproval,
    pendingApproval
  } = useUploadPhotos(userPhotos);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        
        // Fetch user photos - exclude soft deleted photos
        const { data: photosData, error: photosError } = await supabase
          .from('profile_photos')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null) // Only fetch non-deleted photos
          .order('sort_order');
          
        if (photosError) throw photosError;
        
        const photoUrls = photosData.map(photo => photo.url);
        setUserPhotos(photoUrls);
        
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, toast]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return;
    
    const file = event.target.files[0];
    const index = selectedPhotoIndex !== null ? selectedPhotoIndex : userPhotos.length;
    
    try {
      const result = await updateProfilePhoto(file, index);
      
      if (result.success && result.publicUrl) {
        // Add the photo to the list only for UI purposes
        // It will need admin approval before becoming official
        if (selectedPhotoIndex !== null) {
          const newPhotos = [...userPhotos];
          newPhotos[selectedPhotoIndex] = result.publicUrl;
          setUserPhotos(newPhotos);
        } else {
          setUserPhotos([...userPhotos, result.publicUrl]);
        }
        
        toast({
          title: language === 'ko' ? "성공" : "成功",
          description: language === 'ko' 
            ? "프로필 사진이 변경 요청되었습니다. 관리자 승인 후 적용됩니다." 
            : "プロフィール写真の変更がリクエストされました。管理者の承認後に適用されます。"
        });
      } else {
        toast({
          title: language === 'ko' ? "오류" : "エラー",
          description: result.error || (language === 'ko' ? "알 수 없는 오류가 발생했습니다" : "不明なエラーが発生しました"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      toast({
        title: language === 'ko' ? "오류" : "エラー",
        description: language === 'ko' ? "프로필 사진 업데이트 실패" : "プロフィール写真の更新に失敗しました",
        variant: "destructive"
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedPhotoIndex(null);
    }
  };

  const handleAddPhoto = () => {
    setSelectedPhotoIndex(null);
    fileInputRef.current?.click();
  };

  const handleUpdatePhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async (index: number) => {
    try {
      await removePhoto(index);
      // The UI update will be handled within the removePhoto function
      // This now properly soft deletes the photo in the database
    } catch (error) {
      console.error("Error removing photo:", error);
      toast({
        title: language === 'ko' ? "오류" : "エラー",
        description: language === 'ko' ? "프로필 사진 삭제 실패" : "プロフィール写真の削除に失敗しました",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  if (!userProfile) {
    return (
      <MainLayout>
        <div className="text-center p-10">
          <h2 className="text-2xl font-bold mb-4">
            {t("profile.not_found")}
          </h2>
          <p>{t("profile.might_not_exist")}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("profile.my_profile")}</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">{t("profile.photos")}</h2>
            
            <ProfilePhotoGrid
              photos={userPhotos}
              isPendingApproval={isPendingApproval}
              onAddPhoto={handleAddPhoto}
              onRemovePhoto={handleRemovePhoto}
              onUpdatePhoto={handleUpdatePhoto}
              isUploading={isUploading}
            />
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />
            
            <p className="text-sm text-gray-500 mt-4">
              {language === 'ko' 
                ? '프로필 사진은 관리자 승인 후 공개됩니다. 최대 9장까지 등록 가능합니다.' 
                : 'プロフィール写真は管理者の承認後に公開されます。最大9枚まで登録できます。'}
            </p>
          </CardContent>
        </Card>
        
        {/* Rest of user profile details remain the same */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">{t("profile.details")}</h2>
            <div className="grid gap-4">
              <div>
                <label className="text-gray-700">{t("profile.nickname")}</label>
                <p>{userProfile.nickname || "N/A"}</p>
              </div>
              <div>
                <label className="text-gray-700">{t("profile.bio")}</label>
                <p>{userProfile.bio || "N/A"}</p>
              </div>
              {/* Add more profile details here */}
            </div>
            <Button>{t("profile.edit")}</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
