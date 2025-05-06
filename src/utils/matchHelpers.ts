
import { supabase } from "@/integrations/supabase/client";

// Function to send a match request using RPC
export const sendMatchRequest = async (targetProfileId: string): Promise<boolean> => {
  try {
    console.log("[matchHelpers Debug] Sending match request to:", targetProfileId);
    
    if (!targetProfileId) {
      console.error("[matchHelpers Debug] Error: targetProfileId is empty or undefined");
      throw new Error("Target profile ID is required");
    }
    
    const { data, error } = await supabase.rpc('send_match_request_rpc', {
      target_profile_id: targetProfileId
    });
    
    if (error) {
      console.error("[matchHelpers Debug] Error executing send_match_request_rpc:", error);
      console.error("[matchHelpers Debug] Error details:", JSON.stringify(error));
      throw error;
    }
    
    console.log("[matchHelpers Debug] Match request response:", data);
    return true;
  } catch (error) {
    console.error("[matchHelpers Debug] Error sending match request:", error);
    console.error("[matchHelpers Debug] Error object details:", JSON.stringify(error));
    throw error;
  }
};

// Function to accept a match request using RPC
export const acceptMatchRequest = async (requestId: string): Promise<boolean> => {
  try {
    console.log("[matchHelpers Debug] Accepting match request:", requestId);
    
    const { data, error } = await supabase.rpc('accept_match_request_rpc', {
      request_id: requestId
    });
    
    if (error) {
      console.error("[matchHelpers Debug] Error executing accept_match_request_rpc:", error);
      throw error;
    }
    
    console.log("[matchHelpers Debug] Accept request response:", data);
    return true;
  } catch (error) {
    console.error("[matchHelpers Debug] Error accepting match request:", error);
    throw error;
  }
};

// Function to reject a match request using RPC
export const rejectMatchRequest = async (requestId: string): Promise<boolean> => {
  try {
    console.log("[matchHelpers Debug] Rejecting match request:", requestId);
    
    const { data, error } = await supabase.rpc('reject_match_request_rpc', {
      request_id: requestId
    });
    
    if (error) {
      console.error("[matchHelpers Debug] Error executing reject_match_request_rpc:", error);
      throw error;
    }
    
    console.log("[matchHelpers Debug] Reject request response:", data);
    return true;
  } catch (error) {
    console.error("[matchHelpers Debug] Error rejecting match request:", error);
    throw error;
  }
};

// Function to get daily recommendations using RPC
export const getDailyRecommendations = async (): Promise<any[]> => {
  try {
    console.log("[matchHelpers Debug] Fetching daily recommendations");
    
    const { data, error } = await supabase.rpc('get_daily_recommendations_rpc');
    
    if (error) {
      console.error("[matchHelpers Debug] Error executing get_daily_recommendations_rpc:", error);
      console.error("[matchHelpers Debug] Error details:", JSON.stringify(error));
      throw error;
    }
    
    console.log("[matchHelpers Debug] Raw recommendations data:", data);
    
    // Check if data contains a success and data property
    if (data && data.success && Array.isArray(data.data)) {
      return data.data;
    }
    
    // If the response format is unexpected, return empty array
    console.warn("[matchHelpers Debug] Unexpected recommendation data format:", data);
    return [];
  } catch (error) {
    console.error("[matchHelpers Debug] Error fetching daily recommendations:", error);
    console.error("[matchHelpers Debug] Error object details:", JSON.stringify(error));
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
    
    // Get pending matches based on type (sent or received)
    const query = supabase
      .from('matches')
      .select(`
        id, 
        status, 
        created_at,
        ${type === 'sent' ? 'target_user_id' : 'user_id'},
        users:${type === 'sent' ? 'target_user_id' : 'user_id'}(id, nickname)
      `)
      .eq(type === 'sent' ? 'user_id' : 'target_user_id', userData.user.id);
    
    // If looking at received requests, only show pending ones
    if (type === 'received') {
      query.eq('status', 'pending');
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }

    // Format the data to match the expected interface
    const requests: MatchRequest[] = (data || []).map((match: any) => {
      const user = match.users;
      const photoPromise = supabase
        .from('profile_photos')
        .select('url')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();
        
      return {
        id: match.id,
        status: match.status,
        requested_at: match.created_at,
        user: {
          id: user.id,
          nickname: user.nickname,
          photo_url: '', // Will be filled in after getting photos
        },
      };
    });
    
    // Get photos in parallel
    const requestsWithPhotos = await Promise.all(
      requests.map(async (request) => {
        const { data: photoData } = await supabase
          .from('profile_photos')
          .select('url')
          .eq('user_id', request.user.id)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();
        
        return {
          ...request,
          user: {
            ...request.user,
            photo_url: photoData?.url || '/placeholder.svg',
          },
        };
      })
    );
    
    return requestsWithPhotos;
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
