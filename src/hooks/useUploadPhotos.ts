
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { uploadProfilePhoto } from "@/utils/storageHelpers";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const removePhoto = async (index: number) => {
    if (!user) return;
    
    try {
      setIsUploading(true);
      const photoUrl = photos[index];
      
      // Find the photo ID in the database
      const { data: photoData, error: findError } = await supabase
        .from('profile_photos')
        .select('id')
        .eq('url', photoUrl)
        .eq('user_id', user.id)
        .is('deleted_at', null) // Make sure we're not finding already deleted photos
        .single();
        
      if (findError) {
        console.error("Error finding photo:", findError);
        throw findError;
      }
      
      if (!photoData?.id) {
        console.error("Photo not found in database");
        throw new Error("Photo not found in database");
      }
      
      // Soft delete the photo by setting deleted_at
      const { error: deleteError } = await supabase
        .from('profile_photos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', photoData.id);
        
      if (deleteError) {
        console.error("Error soft-deleting photo:", deleteError);
        throw deleteError;
      }
      
      // Remove from the local state
      const newPhotos = [...photos];
      newPhotos.splice(index, 1);
      setPhotos(newPhotos);
      
      toast({
        title: "Success",
        description: "Photo has been removed"
      });
      
    } catch (error) {
      console.error("Error removing photo:", error);
      toast({
        title: "Error",
        description: "Failed to remove photo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
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
