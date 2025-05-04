
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";

export const uploadProfilePhoto = async (userId: string, file: File, sortOrder: number): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile_photos')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('profile_photos')
      .getPublicUrl(filePath);
    
    const publicUrl = data.publicUrl;
    
    // Save reference in profile_photos table
    const { error: dbError } = await supabase
      .from('profile_photos')
      .insert({
        user_id: userId,
        url: publicUrl,
        sort_order: sortOrder
      });
      
    if (dbError) throw dbError;
    
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
    
    const { error: uploadError } = await supabase.storage
      .from('identity_documents')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('identity_documents')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading identity document:", error);
    throw error;
  }
};
