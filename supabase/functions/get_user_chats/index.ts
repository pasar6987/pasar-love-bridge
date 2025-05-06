
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface ChatSession {
  match_id: string;
  partner_id: string;
  partner_nickname: string;
  partner_photo: string | null;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Extract token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client
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

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('Error getting user');
    }

    console.log('Successfully authenticated user:', user.id);

    // For now, return mock data
    // In a real application, you'd query the matches and chat_messages tables
    const mockChats: ChatSession[] = [
      {
        match_id: '1',
        partner_id: '101',
        partner_nickname: 'Yuna',
        partner_photo: '/placeholder.svg',
        last_message: '안녕하세요! 반가워요.',
        last_message_time: new Date().toISOString(),
        unread_count: 2
      },
      {
        match_id: '2',
        partner_id: '102',
        partner_nickname: 'Haruki',
        partner_photo: '/placeholder.svg',
        last_message: 'こんにちは！よろしくお願いします。',
        last_message_time: new Date(Date.now() - 86400000).toISOString(),
        unread_count: 0
      }
    ];

    return new Response(
      JSON.stringify(mockChats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return new Response(
      JSON.stringify([]),  // Return empty array instead of error
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,  // Return 200 with empty array instead of 400 to prevent CORS issues
      }
    );
  }
});
