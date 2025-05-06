
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // OPTIONS 요청 처리 (preflight request)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Supabase 클라이언트 초기화
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? '',
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 요청 데이터 파싱
    const { target_profile_id } = await req.json();
    if (!target_profile_id) {
      return new Response(JSON.stringify({ error: 'Missing target profile ID' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 토큰에서 사용자 ID 가져오기
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token', details: userError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = user.id;

    // 이미 존재하는 매치 요청 확인
    const { data: existingMatch, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .eq('target_user_id', target_profile_id)
      .single();

    if (existingMatch) {
      return new Response(JSON.stringify({ success: true, message: 'Match request already exists' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 새 매치 요청 생성
    const { data: newMatch, error: insertError } = await supabaseAdmin
      .from('matches')
      .insert({
        user_id: userId,
        target_user_id: target_profile_id,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Failed to create match request', details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 타겟 유저에게 알림 생성
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: target_profile_id,
        type: 'match_request',
        title: '새로운 매칭 요청',
        body: '누군가 당신에게 관심을 보였습니다!',
        related_id: newMatch.id,
        is_read: false
      });

    // 성공 응답 반환
    return new Response(JSON.stringify({ success: true, data: newMatch }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    // 에러 처리
    console.error("Error processing match request:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
