
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

export const uploadProfilePhoto = async (userId: string, file: File, sortOrder: number): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log("Uploading profile photo:", {userId, filePath, bucket: 'profile_photos'});
    
    const { error: uploadError, data } = await supabase.storage
      .from('profile_photos')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    const { data: urlData } = supabase.storage
      .from('profile_photos')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    console.log("Generated public URL:", publicUrl);
    
    // Save reference in profile_photos table
    const { error: dbError } = await supabase
      .from('profile_photos')
      .insert({
        user_id: userId,
        url: publicUrl,
        sort_order: sortOrder
      });
      
    if (dbError) {
      console.error("Database insert error:", dbError);
      throw dbError;
    }
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw error;
  }
};

export const uploadIdentityDocument = async (userId: string, file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log("Uploading identity document:", {userId, filePath, bucket: 'identity_documents'});
    
    const { error: uploadError } = await supabase.storage
      .from('identity_documents')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    const { data: urlData } = supabase.storage
      .from('identity_documents')
      .getPublicUrl(filePath);
    
    console.log("Generated public URL:", urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading identity document:", error);
    throw error;
  }
};
