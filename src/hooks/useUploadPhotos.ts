import { useState } from "react";
import { uploadProfilePhoto } from "@/utils/storageHelpers";
import { useToast } from "./use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export function useUploadPhotos() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    setIsUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        if (!file.type.startsWith("image/")) {
          throw new Error("Invalid file type. Only images are allowed.");
        }
        
        // Convert file to data URL for preview
        const dataUrl = await readFileAsDataURL(file);
        
        // Upload to Supabase Storage
        const sortOrder = photos.length + index;
        const publicUrl = await uploadProfilePhoto(user.id, file, sortOrder);
        
        return { dataUrl, publicUrl };
      });
      
      const results = await Promise.all(uploadPromises);
      
      setPhotos(prev => [
        ...prev,
        ...results.map(result => result.dataUrl)
      ]);
      
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      newPhotos.splice(index, 1);
      return newPhotos;
    });
    
    // Note: We're not deleting from storage here to keep it simple,
    // but in a production app you might want to delete unused photos
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    photos,
    isUploading,
    handleFileUpload,
    removePhoto
  };
}
