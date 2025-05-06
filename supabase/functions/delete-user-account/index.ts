
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

    console.log('User found, proceeding with account deletion:', user.id);

    // 사용자 ID 가져오기
    const userId = user.id;
    
    // 1. 먼저, 관련된 모든 테이블에서 사용자 데이터 삭제
    console.log('Deleting user data from related tables');
    
    try {
      // 프로필 사진 삭제
      await supabase.from('profile_photos').delete().eq('user_id', userId);
      console.log('Deleted profile photos');
      
      // 사용자 국적 정보 삭제
      await supabase.from('user_nationalities').delete().eq('user_id', userId);
      console.log('Deleted user nationalities');
      
      // 사용자 관심사 삭제
      await supabase.from('user_interests').delete().eq('user_id', userId);
      console.log('Deleted user interests');
      
      // 언어 능력 삭제
      await supabase.from('language_skills').delete().eq('user_id', userId);
      console.log('Deleted language skills');
      
      // 신원 인증 정보 삭제
      await supabase.from('identity_verifications').delete().eq('user_id', userId);
      console.log('Deleted identity verifications');
      
      // 인증 요청 삭제
      await supabase.from('verification_requests').delete().eq('user_id', userId);
      console.log('Deleted verification requests');
      
      // 사용자가 포함된 매치 ID 가져오기
      const { data: matchIds, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`user_id.eq.${userId},target_user_id.eq.${userId}`);
      
      if (matchError) {
        console.error('Error getting matches:', matchError);
      }
      
      if (matchIds && matchIds.length > 0) {
        console.log('Found matches to delete:', matchIds.length);
        
        // 해당 매치의 채팅 메시지 삭제
        await supabase
          .from('chat_messages')
          .delete()
          .in('match_id', matchIds.map(m => m.id));
        console.log('Deleted chat messages for matches');
        
        // 매치 삭제
        await supabase
          .from('matches')
          .delete()
          .or(`user_id.eq.${userId},target_user_id.eq.${userId}`);
        console.log('Deleted matches');
      } else {
        console.log('No matches found for this user');
      }
      
      // 알림 삭제
      await supabase.from('notifications').delete().eq('user_id', userId);
      console.log('Deleted notifications');
      
      // 사용자 프로필 삭제
      await supabase.from('users').delete().eq('id', userId);
      console.log('Deleted user profile');
      
      // 마지막으로, auth.users에서 사용자 삭제
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authDeleteError) {
        console.error('Error deleting user from auth.users:', authDeleteError);
        throw authDeleteError;
      }
      
      console.log('Successfully deleted user from auth.users');
    } catch (deleteError) {
      console.error('Error during deletion process:', deleteError);
      throw deleteError;
    }

    console.log('Account deletion completed successfully for user:', userId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
