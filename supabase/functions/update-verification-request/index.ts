
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get auth token from request header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Get the current user and check if they're an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Check if the user is an admin
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin', {
      user_id: user.id
    });
    
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Not authorized, admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Get the request body
    const requestData = await req.json();
    const { request_id, status, rejection_reason } = requestData;
    
    if (!request_id || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get the verification request first
    const { data: requestInfo, error: requestError } = await supabaseClient
      .from('verification_requests')
      .select('*')
      .eq('id', request_id)
      .single();
      
    if (requestError) {
      console.error("Error fetching verification request:", requestError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch verification request', details: requestError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Update the verification request
    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }
    
    const { error: updateError } = await supabaseClient
      .from('verification_requests')
      .update(updateData)
      .eq('id', request_id);
    
    if (updateError) {
      console.error("Error updating verification request:", updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update verification request', details: updateError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Determine notification type based on the verification request type
    let notificationType: string;
    let notificationTitle: string;
    let notificationBody: string;
    
    if (requestInfo.type === 'profile_photo') {
      if (status === 'approved') {
        notificationType = 'profile_photo_approved';
        notificationTitle = '프로필 사진 승인됨';
        notificationBody = '프로필 사진 변경이 승인되었습니다.';
        
        // If approved and it's a profile photo, update the user metadata with the new photo URL
        if (requestInfo.photo_url) {
          // Update the user metadata with the new photo URL
          const { error: metadataError } = await supabaseClient.auth.updateUser({
            data: { avatar_url: requestInfo.photo_url }
          });
          
          if (metadataError) {
            console.error("Error updating user metadata:", metadataError);
            // Continue execution - notification will still be sent
          }
        }
      } else if (status === 'rejected') {
        notificationType = 'profile_photo_rejected';
        notificationTitle = '프로필 사진 거부됨';
        notificationBody = rejection_reason 
          ? `프로필 사진이 거부되었습니다. 사유: ${rejection_reason}`
          : '프로필 사진이 거부되었습니다.';
      }
    } else {
      // Default for other verification types
      if (status === 'approved') {
        notificationType = 'verify_passed';
        notificationTitle = '프로필 사진 승인됨';
        notificationBody = '프로필 사진 변경이 승인되었습니다.';
      } else if (status === 'rejected') {
        notificationType = 'verify_rejected';
        notificationTitle = '프로필 사진 거부됨';
        notificationBody = rejection_reason 
          ? `프로필 사진이 거부되었습니다. 사유: ${rejection_reason}`
          : '프로필 사진이 거부되었습니다.';
      }
    }
    
    // Send notification if we have notification content
    if (notificationType && notificationTitle && notificationBody) {
      const { error: notificationError } = await supabaseClient.rpc(
        'create_admin_notification',
        {
          p_user_id: requestInfo.user_id,
          p_type: notificationType,
          p_title: notificationTitle,
          p_body: notificationBody
        }
      );
      
      if (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Continue execution - the verification update was successful
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification request updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
