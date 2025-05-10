import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  console.log('Delete user account function called')

  try {
    // 요청 본문에서 JWT 토큰 가져오기
    const { token } = await req.json();
    
    if (!token) {
      console.error('Missing token in request body');
      throw new Error('Missing token in request body');
    }
    
    console.log('Token received from client');

    // 서비스 롤 키를 사용하여 Supabase 클라이언트 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
    
    console.log('Supabase client created with service role key');

    // JWT 토큰으로 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('User data response:', user ? 'User found' : 'User not found', 'Error:', userError);

    if (userError || !user) {
      console.error('Error getting user:', userError?.message || 'User not found');
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'));
    }

    console.log('User found, proceeding with account soft deletion:', user.id);

    // 사용자 ID 가져오기
    const userId = user.id;
    const currentTimestamp = new Date().toISOString();
    
    try {
      // Soft delete the user profile (set deleted_at timestamp)
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          deleted_at: currentTimestamp,
          nickname: `Deleted User ${currentTimestamp}`, // Anonymize the user data
          bio: null,
          city: null,
          country_code: null
        })
        .eq('id', userId);
      
      if (userUpdateError) {
        console.error('Error soft-deleting user profile:', userUpdateError);
        throw userUpdateError;
      }
      console.log('Successfully soft-deleted user profile');
      
      // Soft delete all profile photos
      const { error: photosUpdateError } = await supabase
        .from('profile_photos')
        .update({ deleted_at: currentTimestamp })
        .eq('user_id', userId);
        
      if (photosUpdateError) {
        console.error('Error soft-deleting profile photos:', photosUpdateError);
        // Continue with other operations even if this one fails
      } else {
        console.log('Successfully soft-deleted profile photos');
      }
      
      // Keep user nationalities but disconnect them from the user?
      // We could soft delete these too if needed
      
      // Keep user interests but disconnect them from the user?
      // We could soft delete these too if needed
      
      // Keep identity verifications for record-keeping but mark as deleted
      // We could soft delete these too if needed
      
      // Keep verification requests for record-keeping
      // We could soft delete these too if needed
      
      // Handle chat messages (optionally anonymize them)
      // For now, we'll leave them as is for chat history integrity
      
      // Handle matches - mark as deleted or keep for analytics
      // For now, we'll leave them as is
      
      // Mark notifications as read to clean up UI for other users
      const { error: notificationsError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
      
      if (notificationsError) {
        console.error('Error updating notifications:', notificationsError);
        // Continue with other operations
      } else {
        console.log('Successfully marked notifications as read');
      }
      
      // We don't completely delete the auth.users entry
      // Instead, disable the user account so they can't log in anymore
      const { error: authDisableError } = await supabase.auth.admin.updateUserById(
        userId,
        { banned: true }
      );
      
      if (authDisableError) {
        console.error('Error disabling user account:', authDisableError);
        throw authDisableError;
      }
      
      console.log('Successfully disabled user account');
      
    } catch (deleteError) {
      console.error('Error during soft deletion process:', deleteError);
      throw deleteError;
    }

    console.log('Account soft deletion completed successfully for user:', userId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // 에러 전체 객체를 JSON.stringify로 출력
    try {
      console.error('Error in delete-user-account function (stringified):', JSON.stringify(error));
    } catch (stringifyErr) {
      console.error('Error in delete-user-account function (raw):', error);
    }
    console.error('Error in delete-user-account function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred', raw: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
