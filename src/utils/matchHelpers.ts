
import { supabase } from "@/integrations/supabase/client";

// Function to send a match request
export const sendMatchRequest = async (targetProfileId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('send_match_request', {
      body: { target_profile_id: targetProfileId }
    });
    
    if (error) {
      throw error;
    }
    
    return data as boolean;
  } catch (error) {
    console.error("Error sending match request:", error);
    throw error;
  }
};

// Function to accept a match request
export const acceptMatchRequest = async (requestId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('accept_match_request', {
      body: { request_id: requestId }
    });
    
    if (error) {
      throw error;
    }
    
    return data as boolean;
  } catch (error) {
    console.error("Error accepting match request:", error);
    throw error;
  }
};

// Function to reject a match request
export const rejectMatchRequest = async (requestId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('reject_match_request', {
      body: { request_id: requestId }
    });
    
    if (error) {
      throw error;
    }
    
    return data as boolean;
  } catch (error) {
    console.error("Error rejecting match request:", error);
    throw error;
  }
};

// Function to get daily recommendations
export const getDailyRecommendations = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_daily_recommendations');
    
    if (error) {
      throw error;
    }
    
    return data as any[] || [];
  } catch (error) {
    console.error("Error fetching daily recommendations:", error);
    return [];
  }
};

export interface MatchRequest {
  id: string;
  status: string;
  requested_at: string;
  user: {
    id: string;
    nickname: string;
    photo_url: string;
  };
}

// Function to get match requests (both sent and received)
export const getMatchRequests = async (type: 'sent' | 'received'): Promise<MatchRequest[]> => {
  try {
    const { data: userId } = await supabase.auth.getUser();
    
    if (!userId.user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase.functions.invoke('get_match_requests', {
      body: { request_type: type }
    });
    
    if (error) {
      throw error;
    }
    
    return (data as MatchRequest[]) || [];
  } catch (error) {
    console.error(`Error fetching ${type} match requests:`, error);
    return [];
  }
};
