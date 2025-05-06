
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
    
    // 스토리지에 업로드된 파일 확인
    const fileExists = await checkFileExists('profile_photos', filePath);
    console.log("파일 업로드 확인 결과:", fileExists);
    
    if (!fileExists) {
      throw new Error("File upload verified failed - file does not exist after upload");
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
    
    console.log("Uploading identity document:", {userId, filePath, bucket: 'identity_documents', fileSize: file.size, fileType: file.type});
    
    // 파일이 큰 경우, 분할 업로드 또는 압축을 고려할 수 있음
    if (file.size > 5 * 1024 * 1024) { // 5MB 이상인 경우
      console.warn("Large file detected, may encounter upload issues:", file.size);
    }
    
    // Supabase 스토리지 업로드
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
    
    // 스토리지에 업로드된 파일 확인
    const fileExists = await checkFileExists('identity_documents', filePath);
    console.log("파일 업로드 확인 결과:", fileExists);
    
    if (!fileExists) {
      throw new Error("File upload verified failed - file does not exist after upload");
    }
    
    const { data: urlData } = supabase.storage
      .from('identity_documents')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;
    console.log("Generated public URL:", publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error("Error uploading identity document:", error);
    throw error;
  }
};

// 파일 존재 여부를 확인하는 함수
export const checkFileExists = async (bucket: string, path: string): Promise<boolean> => {
  try {
    console.log(`Checking if file exists in bucket ${bucket}, path: ${path}`);
    
    // HEAD 요청으로 파일 존재 여부 확인 (더 효율적)
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60);
      
    if (error) {
      console.error("File check error:", error);
      return false;
    }
    
    if (data && data.signedUrl) {
      // 실제로 URL이 유효한지 확인
      try {
        const response = await fetch(data.signedUrl, { method: 'HEAD' });
        return response.ok;
      } catch (fetchError) {
        console.error("Error checking URL validity:", fetchError);
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking file existence:", error);
    return false;
  }
};
