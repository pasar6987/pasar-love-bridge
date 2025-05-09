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
    // 요청 헤더에서 Authorization 토큰 가져오기
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ 
          error: 'Missing or invalid Authorization header',
          success: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token received from Authorization header');

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
      return new Response(
        JSON.stringify({ 
          error: 'Error getting user: ' + (userError?.message || 'User not found'),
          success: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
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
      console.error('Error deleting user data:', deleteError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete user data: ' + deleteError.message,
          success: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // 마지막으로 auth.users에서 사용자 삭제
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting user from auth:', authDeleteError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete user from auth: ' + authDeleteError.message,
          success: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Account deletion completed successfully for user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account deleted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
