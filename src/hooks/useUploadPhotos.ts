
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { uploadProfilePhoto } from "@/utils/storageHelpers";

export interface UploadPhotoResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

export const useUploadPhotos = (
  initialPhotos: string[] = [],
  updateTempData?: (photos: string[]) => void
) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<string[]>([]);
  const { user } = useAuth();

  // Update tempData whenever photos change if updateTempData is provided
  useEffect(() => {
    if (updateTempData) {
      updateTempData(photos);
    }
  }, [photos, updateTempData]);

  // Check if any photos are pending approval
  useEffect(() => {
    const checkPendingApprovals = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('verification_requests')
          .select('photo_url')
          .eq('user_id', user.id)
          .eq('type', 'profile_photo')
          .eq('status', 'pending');
          
        if (error) {
          console.error("Error checking pending approvals:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const pendingUrls = data.map(item => item.photo_url).filter(Boolean);
          setPendingApproval(pendingUrls as string[]);
        }
      } catch (error) {
        console.error("Error in checkPendingApprovals:", error);
      }
    };
    
    checkPendingApprovals();
  }, [user]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    setIsUploading(true);

    try {
      const newPhotos = [...photos];
      
      // Limit to maximum 9 photos
      const availableSlots = 9 - photos.length;
      if (availableSlots <= 0) {
        throw new Error("Maximum 9 photos allowed");
      }
      
      const filesToUpload = Array.from(files).slice(0, availableSlots);
      
      for (const file of filesToUpload) {
        // 5MB size limit
        if (file.size > 5 * 1024 * 1024) {
          console.error("File size exceeds 5MB limit");
          continue;
        }
        
        // Calculate the sort order for the new photo
        const sortOrder = photos.length + newPhotos.length - photos.length;
        
        // Use the uploadProfilePhoto utility function to handle the upload and database entry
        const publicUrl = await uploadProfilePhoto(user.id, file, sortOrder);
        
        if (publicUrl) {
          newPhotos.push(publicUrl);
          console.log("Photo uploaded successfully:", publicUrl);
        }
      }
      
      setPhotos(newPhotos);
      
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const removePhoto = (index: number) => {
    // Only remove from the temporary data
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };
  
  const updateProfilePhoto = async (file: File, index: number): Promise<UploadPhotoResult> => {
    if (!user) return { success: false, error: "Not authenticated" };
    
    try {
      setIsUploading(true);
      
      // 5MB size limit
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: "File size exceeds 5MB limit" };
      }
      
      // Upload the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Create a verification request for the photo
      const { data, error } = await supabase.functions.invoke('create-verification-request', {
        body: {
          type: 'profile_photo',
          photo_url: publicUrl,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0]
        }
      });
      
      if (error) throw error;
      
      // Add to pending approval
      setPendingApproval(prev => [...prev, publicUrl]);
      
      return { success: true, publicUrl };
    } catch (error) {
      console.error("Error updating profile photo:", error);
      return { success: false, error: String(error) };
    } finally {
      setIsUploading(false);
    }
  };
  
  const isPendingApproval = (url: string): boolean => {
    return pendingApproval.includes(url);
  };
  
  return {
    photos,
    isUploading,
    handleFileUpload,
    removePhoto,
    updateProfilePhoto,
    isPendingApproval,
    pendingApproval
  };
};
