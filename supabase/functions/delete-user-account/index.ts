
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

  try {
    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('Missing authorization header')
    }

    // Create a Supabase client with the auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } }
    )

    // Get user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Error getting user')
    }

    console.log('User found, proceeding with account deletion:', user.id);

    // 직접 user_id를 세션에서 가져와 사용
    const userId = user.id;
    
    // 1. First, delete user data from all related tables
    
    // Delete profile photos
    await supabase.from('profile_photos').delete().eq('user_id', userId);
    
    // Delete user nationalities
    await supabase.from('user_nationalities').delete().eq('user_id', userId);
    
    // Delete user interests
    await supabase.from('user_interests').delete().eq('user_id', userId);
    
    // Delete language skills
    await supabase.from('language_skills').delete().eq('user_id', userId);
    
    // Delete identity verifications
    await supabase.from('identity_verifications').delete().eq('user_id', userId);
    
    // Delete verification requests
    await supabase.from('verification_requests').delete().eq('user_id', userId);
    
    // Get match IDs where user is involved
    const { data: matchIds } = await supabase
      .from('matches')
      .select('id')
      .or(`user_id.eq.${userId},target_user_id.eq.${userId}`);
    
    if (matchIds && matchIds.length > 0) {
      // Delete chat messages for those matches
      await supabase
        .from('chat_messages')
        .delete()
        .in('match_id', matchIds.map(m => m.id));
      
      // Delete matches
      await supabase
        .from('matches')
        .delete()
        .or(`user_id.eq.${userId},target_user_id.eq.${userId}`);
    }
    
    // Delete notifications
    await supabase.from('notifications').delete().eq('user_id', userId);
    
    // Delete user profile
    await supabase.from('users').delete().eq('id', userId);
    
    // Finally, delete the user from auth.users using admin privileges
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authDeleteError) {
      throw authDeleteError;
    }

    console.log('Account deletion successful for user:', userId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
