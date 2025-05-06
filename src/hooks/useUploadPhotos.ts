
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useUploadPhotos = (
  initialPhotos: string[] = [],
  updateTempData?: (photos: string[]) => void
) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  // updateTempData가 있을 때마다 photos가 변경되면 tempData 업데이트
  useEffect(() => {
    if (updateTempData) {
      updateTempData(photos);
    }
  }, [photos, updateTempData]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    setIsUploading(true);

    try {
      const newPhotos = [...photos];
      
      // 업로드 가능한 사진 수 제한 (최대 6장)
      const availableSlots = 6 - photos.length;
      const filesToUpload = Array.from(files).slice(0, availableSlots);
      
      for (const file of filesToUpload) {
        // 5MB 크기 제한
        if (file.size > 5 * 1024 * 1024) {
          console.error("File size exceeds 5MB limit");
          continue;
        }
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        // 파일 업로드
        const { error: uploadError, data } = await supabase.storage
          .from('profile_photos')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // 공개 URL 가져오기
        const { data: { publicUrl } } = supabase.storage
          .from('profile_photos')
          .getPublicUrl(filePath);
          
        newPhotos.push(publicUrl);
      }
      
      setPhotos(newPhotos);
      
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const removePhoto = (index: number) => {
    // 임시 데이터에서만 삭제 (실제 스토리지에서는 삭제하지 않음)
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };
  
  return {
    photos,
    isUploading,
    handleFileUpload,
    removePhoto
  };
};
