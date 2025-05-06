
import { supabase } from "@/integrations/supabase/client";

// Function to send a match request
export const sendMatchRequest = async (targetProfileId: string): Promise<boolean> => {
  try {
    console.log("[matchHelpers Debug] Sending match request to:", targetProfileId);
    
    const { data, error } = await supabase.functions.invoke('send_match_request', {
      body: { target_profile_id: targetProfileId }
    });
    
    if (error) {
      console.error("[matchHelpers Debug] Error invoking send_match_request:", error);
      throw error;
    }
    
    console.log("[matchHelpers Debug] Match request response:", data);
    return true;
  } catch (error) {
    console.error("[matchHelpers Debug] Error sending match request:", error);
    throw error;
  }
};

// Function to accept a match request
export const acceptMatchRequest = async (requestId: string): Promise<boolean> => {
  try {
    console.log("[matchHelpers Debug] Accepting match request:", requestId);
    
    const { data, error } = await supabase.functions.invoke('accept_match_request', {
      body: { request_id: requestId }
    });
    
    if (error) {
      console.error("[matchHelpers Debug] Error invoking accept_match_request:", error);
      throw error;
    }
    
    console.log("[matchHelpers Debug] Accept request response:", data);
    return true;
  } catch (error) {
    console.error("[matchHelpers Debug] Error accepting match request:", error);
    throw error;
  }
};

// Function to reject a match request
export const rejectMatchRequest = async (requestId: string): Promise<boolean> => {
  try {
    console.log("[matchHelpers Debug] Rejecting match request:", requestId);
    
    const { data, error } = await supabase.functions.invoke('reject_match_request', {
      body: { request_id: requestId }
    });
    
    if (error) {
      console.error("[matchHelpers Debug] Error invoking reject_match_request:", error);
      throw error;
    }
    
    console.log("[matchHelpers Debug] Reject request response:", data);
    return true;
  } catch (error) {
    console.error("[matchHelpers Debug] Error rejecting match request:", error);
    throw error;
  }
};

// Function to get daily recommendations
export const getDailyRecommendations = async (): Promise<any[]> => {
  try {
    console.log("[matchHelpers Debug] Fetching daily recommendations");
    
    const { data, error } = await supabase.functions.invoke('get_daily_recommendations');
    
    if (error) {
      console.error("[matchHelpers Debug] Error invoking get_daily_recommendations:", error);
      throw error;
    }
    
    console.log("[matchHelpers Debug] Raw recommendations data:", data);
    
    // Ensure we always return an array
    if (!data) {
      console.warn("[matchHelpers Debug] No recommendation data returned");
      return [];
    }
    
    if (!Array.isArray(data)) {
      console.error("[matchHelpers Debug] Recommendation data is not an array:", data);
      // If it's an object with data property that is an array, return that
      if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
        return (data as any).data;
      }
      // Otherwise, wrap it in an array if it's not null
      return data ? [data] : [];
    }
    
    return data;
  } catch (error) {
    console.error("[matchHelpers Debug] Error fetching daily recommendations:", error);
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
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
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

// Function to fetch sent requests - added to fix the import error
export const fetchSentRequests = async (): Promise<MatchRequest[]> => {
  return getMatchRequests('sent');
};

// Function to fetch received requests - added to fix the import error
export const fetchReceivedRequests = async (): Promise<MatchRequest[]> => {
  return getMatchRequests('received');
};

// For compatibility with RecommendationList.tsx
export const fetchDailyRecommendations = getDailyRecommendations;
