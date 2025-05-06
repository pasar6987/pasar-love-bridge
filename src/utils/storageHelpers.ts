
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
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    // Get the correct public URL from Supabase
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
    
    // Supabase storage upload
    const { error: uploadError } = await supabase.storage
      .from('identity_documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    // Get the correct public URL from Supabase
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

// Admin function to get a signed URL for the identity document
export const getAdminSignedUrl = async (bucket: string, path: string, expiresIn: number = 300): Promise<string | null> => {
  try {
    console.log(`Creating admin signed URL for bucket: ${bucket}, path: ${path}`);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    
    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Error in getAdminSignedUrl:", error);
    return null;
  }
};
