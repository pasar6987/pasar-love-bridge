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
    // 요청 헤더에서 토큰 추출
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Supabase 클라이언트 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        } 
      }
    );

    // 토큰으로 사용자 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('Error getting user');
    }

    console.log('Successfully authenticated user:', user.id);

    // 사용자 국적 가져오기
    const { data: nationalityData, error: nationalityError } = await supabase
      .from('users')
      .select('country_code')
      .eq('id', user.id)
      .single();
    
    if (nationalityError) {
      console.log('Error fetching nationality:', nationalityError);
      // 국적 가져오기 실패 시 고정 함수로 대체
      const { data, error } = await supabase.rpc(
        'get_recommended_profiles_by_nationality_fixed',
        { p_user_id: user.id }
      );

      if (error) {
        console.error('Error calling fixed recommendation function:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ recommendations: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 국적 기반 추천 프로필 가져오기
    const { data, error } = await supabase.rpc(
      'get_recommended_profiles_by_nationality_fixed',
      { p_user_id: user.id }
    );

    if (error) {
      console.error('Error calling recommendation function:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ recommendations: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
