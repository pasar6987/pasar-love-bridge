
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  photo_url: string;
  bio: string;
  job: string;
  nationality: string;
  photos?: { url: string }[];
  is_verified?: boolean;
}

// Function to get recommended profiles based on user's nationality
export const getDailyRecommendations = async (): Promise<Profile[]> => {
  try {
    // Call the Supabase function that handles recommendations
    const { data, error } = await supabase.rpc('get_daily_recommendations_rpc');
    
    if (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
    
    if (!data || !data.success || !data.data) {
      console.error("Invalid recommendation data structure:", data);
      return [];
    }
    
    // Add front-end transformations if needed
    return data.data.map((profile: Profile) => {
      // Format the photos array if needed
      const photos = profile.photos || [];
      if (profile.photo_url && photos.length === 0) {
        photos.push({ url: profile.photo_url });
      }
      
      return {
        ...profile,
        photos,
      };
    });
  } catch (error) {
    console.error("Error in getDailyRecommendations:", error);
    return [];
  }
};

// Function to handle user liking a profile
export const likeProfile = async (profileId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('send_match_request_rpc', {
      target_profile_id: profileId
    });
    
    if (error) {
      console.error("Error liking profile:", error);
      return false;
    }
    
    return data?.success || false;
  } catch (error) {
    console.error("Error in likeProfile:", error);
    return false;
  }
};

// Function to handle user passing on a profile
export const passProfile = async (profileId: string): Promise<boolean> => {
  // For now, just log the pass action
  console.log("User passed on profile:", profileId);
  return true;
};
