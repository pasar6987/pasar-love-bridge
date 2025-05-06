
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
    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: 'Missing request ID' }), {
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

    // 매치 요청 정보 가져오기
    const { data: matchRequest, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('id', request_id)
      .eq('target_user_id', userId) // 요청 대상이 현재 사용자인지 확인
      .single();

    if (matchError || !matchRequest) {
      return new Response(JSON.stringify({ error: 'Match request not found or not authorized', details: matchError }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 매치 상태 업데이트
    const { data: updatedMatch, error: updateError } = await supabaseAdmin
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', request_id)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update match status', details: updateError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 매치 요청을 보낸 사용자에게 알림 전송
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: matchRequest.user_id,
        type: 'match_accepted',
        title: '매칭 요청이 수락되었습니다',
        body: '이제 채팅을 시작할 수 있습니다!',
        related_id: request_id,
        is_read: false
      });

    // 성공 응답 반환
    return new Response(JSON.stringify({ success: true, data: updatedMatch }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    // 에러 처리
    console.error("Error processing match acceptance:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
