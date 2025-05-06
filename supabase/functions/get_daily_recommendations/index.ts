
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    console.log("Fetching daily recommendations");
    
    // 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header");
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

    // 토큰에서 사용자 ID 가져오기
    const token = authHeader.replace('Bearer ', '');
    console.log("Token received:", token.substring(0, 10) + "...");
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid token or user not found:", userError);
      return new Response(JSON.stringify({ error: 'Invalid token', details: userError }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = user.id;
    console.log("User ID:", userId);

    // 사용자 국적 확인
    const { data: userNationality, error: nationalityError } = await supabaseAdmin
      .from('user_nationalities')
      .select('nationality')
      .eq('user_id', userId)
      .single();

    if (nationalityError) {
      console.log("Error fetching user nationality, using default profiles");
    }

    const nationality = userNationality?.nationality || 'ja'; // 기본값으로 일본을 설정
    console.log("User nationality:", nationality);

    // 추천 프로필 가져오기 - 모의 데이터
    let profiles = [];
    
    // 국적에 따른 추천 프로필 (한국인에게는 일본 프로필, 일본인에게는 한국 프로필)
    if (nationality === 'ko') {
      profiles = [
        {
          id: '1',
          name: '花子',
          age: 28,
          location: '東京',
          photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
          bio: 'こんにちは！東京に住んでいる花子です。韓国の文化とK-Popに興味があります。',
          job: 'デザイナー',
          nationality: 'ja'
        },
        {
          id: '2',
          name: 'ゆか',
          age: 25,
          location: '大阪',
          photo: 'https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
          bio: '大阪でカフェを経営しています。趣味は旅行と写真撮影です。韓国語を勉強中です！',
          job: 'カフェオーナー',
          nationality: 'ja'
        }
      ];
    } else {
      profiles = [
        {
          id: '3',
          name: '민수',
          age: 29,
          location: '서울',
          photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a29yZWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
          bio: '안녕하세요! 서울에 사는 민수입니다. 일본 문화와 음식에 관심이 많아요.',
          job: '프로그래머',
          nationality: 'ko'
        },
        {
          id: '4',
          name: '준호',
          age: 27,
          location: '부산',
          photo: 'https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXNpYW4lMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
          bio: '부산에서 근무하는 의사입니다. 일본어 공부 중이며 일본 여행을 좋아해요!',
          job: '의사',
          nationality: 'ko'
        }
      ];
    }

    console.log(`Returning ${profiles.length} recommendations`);

    // 성공 응답 반환 - 항상 배열로 반환되도록 보장
    return new Response(JSON.stringify(profiles || []), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    // 에러 처리
    console.error("Error getting recommendations:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
