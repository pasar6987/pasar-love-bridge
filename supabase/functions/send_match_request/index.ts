
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
    console.log("Starting send_match_request function");
    
    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Debug: Log the auth header (omitting sensitive parts)
    console.log("Auth header present:", authHeader.substring(0, 20) + "...");

    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase service key available:", !!supabaseServiceKey);
    
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 요청 데이터 파싱
    console.log("Parsing request body");
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", JSON.stringify(requestBody));
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const { target_profile_id } = requestBody;
    if (!target_profile_id) {
      console.error("Missing target_profile_id in request");
      return new Response(JSON.stringify({ error: 'Missing target profile ID' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    console.log("Target profile ID:", target_profile_id);

    // 토큰에서 사용자 ID 가져오기
    const token = authHeader.replace('Bearer ', '');
    console.log("Getting user from token");
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error("Failed to get user from token:", userError);
      return new Response(JSON.stringify({ error: 'Invalid token', details: userError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!user) {
      console.error("User not found from token");
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = user.id;
    console.log("User ID from token:", userId);

    // 이미 존재하는 매치 요청 확인
    console.log("Checking for existing match request");
    const { data: existingMatch, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('*')
      .eq('user_id', userId)
      .eq('target_user_id', target_profile_id)
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (matchError) {
      console.error("Error checking for existing match:", matchError);
      // This shouldn't be a blocking error, just log it and continue
      console.log("Continuing despite error checking match");
    }

    if (existingMatch) {
      console.log("Match request already exists:", existingMatch);
      return new Response(JSON.stringify({ success: true, message: 'Match request already exists', data: existingMatch }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if target user exists
    console.log("Verifying target user exists");
    const { data: targetUser, error: targetUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', target_profile_id)
      .maybeSingle();
    
    // Target user doesn't need to exist in users table, so this is not a blocking error
    if (targetUserError) {
      console.log("Warning: Error checking target user:", targetUserError);
    }
    
    // 새 매치 요청 생성
    console.log("Creating new match request");
    const { data: newMatch, error: insertError } = await supabaseAdmin
      .from('matches')
      .insert({
        user_id: userId,
        target_user_id: target_profile_id,
        status: 'pending'
      })
      .select()
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (insertError) {
      console.error("Failed to create match request:", insertError);
      return new Response(JSON.stringify({ error: 'Failed to create match request', details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!newMatch) {
      console.error("Match created but no data returned");
      return new Response(JSON.stringify({ error: 'Failed to retrieve created match data' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Match request created:", newMatch);

    // 타겟 유저에게 알림 생성
    console.log("Creating notification for target user");
    try {
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

      if (notificationError) {
        console.error("Warning: Failed to create notification:", notificationError);
        // Continue despite notification error, it's not blocking
      } else {
        console.log("Notification created successfully");
      }
    } catch (notificationError) {
      console.error("Exception while creating notification:", notificationError);
      // Continue despite notification error, it's not blocking
    }

    // 성공 응답 반환
    console.log("Returning successful response");
    return new Response(JSON.stringify({ success: true, data: newMatch }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    // 에러 처리
    console.error("Unhandled error in send_match_request:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
