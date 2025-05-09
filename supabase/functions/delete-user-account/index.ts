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
    console.log('Starting account deletion for user:', userId);

    // 트랜잭션으로 모든 사용자 데이터 삭제
    const { error: deleteError } = await supabase.rpc('delete_user_data', {
      user_id: userId
    });

    if (deleteError) {
      throw deleteError;
    }

    // 마지막으로 auth.users에서 사용자 삭제
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      throw authDeleteError;
    }

    console.log('Account deletion completed successfully for user:', userId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
