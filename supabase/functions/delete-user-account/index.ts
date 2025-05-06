
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
    // Get the authorization header
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      throw new Error('Missing authorization header')
    }

    console.log('Authorization header found')

    // Create a Supabase client with the auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } }
    )

    console.log('Supabase client created with service role key')

    // Get user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log('User data response:', user ? 'User found' : 'User not found', 'Error:', userError)

    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'User not found'))
    }

    console.log('User found, proceeding with account deletion:', user.id)

    // Get the user ID from the authenticated user
    const userId = user.id
    
    // 1. First, delete user data from all related tables
    console.log('Deleting user data from related tables')
    
    try {
      // Delete profile photos
      await supabase.from('profile_photos').delete().eq('user_id', userId)
      console.log('Deleted profile photos')
      
      // Delete user nationalities
      await supabase.from('user_nationalities').delete().eq('user_id', userId)
      console.log('Deleted user nationalities')
      
      // Delete user interests
      await supabase.from('user_interests').delete().eq('user_id', userId)
      console.log('Deleted user interests')
      
      // Delete language skills
      await supabase.from('language_skills').delete().eq('user_id', userId)
      console.log('Deleted language skills')
      
      // Delete identity verifications
      await supabase.from('identity_verifications').delete().eq('user_id', userId)
      console.log('Deleted identity verifications')
      
      // Delete verification requests
      await supabase.from('verification_requests').delete().eq('user_id', userId)
      console.log('Deleted verification requests')
      
      // Get match IDs where user is involved
      const { data: matchIds, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`user_id.eq.${userId},target_user_id.eq.${userId}`)
      
      if (matchError) {
        console.error('Error getting matches:', matchError)
      }
      
      if (matchIds && matchIds.length > 0) {
        console.log('Found matches to delete:', matchIds.length)
        
        // Delete chat messages for those matches
        await supabase
          .from('chat_messages')
          .delete()
          .in('match_id', matchIds.map(m => m.id))
        console.log('Deleted chat messages for matches')
        
        // Delete matches
        await supabase
          .from('matches')
          .delete()
          .or(`user_id.eq.${userId},target_user_id.eq.${userId}`)
        console.log('Deleted matches')
      } else {
        console.log('No matches found for this user')
      }
      
      // Delete notifications
      await supabase.from('notifications').delete().eq('user_id', userId)
      console.log('Deleted notifications')
      
      // Delete user profile
      await supabase.from('users').delete().eq('id', userId)
      console.log('Deleted user profile')
      
      // Finally, delete the user from auth.users
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authDeleteError) {
        console.error('Error deleting user from auth.users:', authDeleteError)
        throw authDeleteError
      }
      
      console.log('Successfully deleted user from auth.users')
    } catch (deleteError) {
      console.error('Error during deletion process:', deleteError)
      throw deleteError
    }

    console.log('Account deletion completed successfully for user:', userId)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in delete-user-account function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
