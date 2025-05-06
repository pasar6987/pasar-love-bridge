
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
    
    // 파일이 큰 경우 경고 메시지
    if (file.size > 5 * 1024 * 1024) {
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
    
    // 파일이 성공적으로 업로드되었는지 확인
    const fileExists = await checkFileExists('identity_documents', filePath);
    console.log("신분증 파일 업로드 확인 결과:", fileExists);
    
    if (!fileExists) {
      throw new Error("File upload verification failed - file not found after upload");
    }
    
    return filePath; // 이제 파일 경로만 반환
  } catch (error) {
    console.error("Error uploading identity document:", error);
    throw error;
  }
};

// 파일 존재 여부를 확인하는 함수 (개선된 버전)
export const checkFileExists = async (bucket: string, path: string): Promise<boolean> => {
  try {
    console.log(`Checking if file exists in bucket ${bucket}, path: ${path}`);
    
    // 경로에서 폴더와 파일명 분리
    const pathParts = path.split('/');
    const fileName = pathParts.pop() || '';
    const folderPath = pathParts.join('/');
    
    // 폴더 내 파일 목록 확인
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });
      
    if (listError) {
      console.error("Error listing files:", listError);
      return false;
    }
    
    const fileExists = files?.some(file => file.name === fileName);
    console.log(`File check result (direct listing): ${fileExists}`, {
      bucket,
      folderPath,
      fileName,
      filesInFolder: files?.map(f => f.name)
    });
    
    return fileExists || false;
  } catch (error) {
    console.error("Error in checkFileExists:", error);
    return false;
  }
};

// 관리자용 서명된 URL을 생성하는 함수 
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
