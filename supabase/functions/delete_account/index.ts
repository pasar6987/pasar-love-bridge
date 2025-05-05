
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Missing authorization header');
    }

    // Create a Supabase client with the auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } }
    );

    // Get user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Error getting user');
    }

    const userId = user.id;

    // Delete user data from all related tables
    // This needs to be done before deleting the auth user
    // Add any other tables that contain user data
    await supabase.from('profile_photos').delete().eq('user_id', userId);
    await supabase.from('user_nationalities').delete().eq('user_id', userId);
    await supabase.from('user_interests').delete().eq('user_id', userId);
    await supabase.from('language_skills').delete().eq('user_id', userId);
    await supabase.from('identity_verifications').delete().eq('user_id', userId);
    await supabase.from('verification_requests').delete().eq('user_id', userId);
    
    // Delete matches and chats
    await supabase.from('chat_messages')
      .delete()
      .or(`match_id.in.(select id from matches where user_id='${userId}' or target_user_id='${userId}')`);
      
    await supabase.from('matches')
      .delete()
      .or(`user_id.eq.${userId},target_user_id.eq.${userId}`);
    
    // Delete notifications
    await supabase.from('notifications').delete().eq('user_id', userId);
    
    // Delete user profile
    await supabase.from('users').delete().eq('id', userId);
    
    // Finally, delete the user from auth.users
    // This requires admin privileges
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
