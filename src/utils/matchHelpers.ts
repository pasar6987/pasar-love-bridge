
import { supabase } from "@/integrations/supabase/client";

export const sendMatchRequest = async (targetUserId: string) => {
  try {
    const { error } = await supabase.rpc(
      'send_match_request',
      { p_target_user_id: targetUserId }
    );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error sending match request:", error);
    throw error;
  }
};

export const acceptMatchRequest = async (requestId: string) => {
  try {
    const { error } = await supabase.rpc(
      'accept_match_request',
      { p_request_id: requestId }
    );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error accepting match request:", error);
    throw error;
  }
};

export const rejectMatchRequest = async (requestId: string) => {
  try {
    const { error } = await supabase.rpc(
      'reject_match_request',
      { p_request_id: requestId }
    );
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error rejecting match request:", error);
    throw error;
  }
};

export const fetchDailyRecommendations = async () => {
  try {
    const { data, error } = await supabase.rpc(
      'get_daily_recommendations'
    );
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching daily recommendations:", error);
    throw error;
  }
};

export const fetchSentRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('match_requests')
      .select(`
        id,
        status,
        requested_at,
        profiles:receiver_id (
          id,
          nickname,
          city,
          profile_photos (url, sort_order)
        )
      `)
      .eq('sender_id', supabase.auth.user()?.id)
      .order('requested_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the data
    return data.map(request => ({
      id: request.id,
      status: request.status,
      requestedAt: request.requested_at,
      profile: {
        id: request.profiles.id,
        name: request.profiles.nickname,
        photo: request.profiles.profile_photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url,
      }
    }));
  } catch (error) {
    console.error("Error fetching sent match requests:", error);
    throw error;
  }
};

export const fetchReceivedRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('match_requests')
      .select(`
        id,
        status,
        requested_at,
        profiles:sender_id (
          id,
          nickname,
          city,
          profile_photos (url, sort_order)
        )
      `)
      .eq('receiver_id', supabase.auth.user()?.id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the data
    return data.map(request => ({
      id: request.id,
      requestedAt: request.requested_at,
      profile: {
        id: request.profiles.id,
        name: request.profiles.nickname,
        photo: request.profiles.profile_photos?.sort((a, b) => a.sort_order - b.sort_order)[0]?.url,
      }
    }));
  } catch (error) {
    console.error("Error fetching received match requests:", error);
    throw error;
  }
};
