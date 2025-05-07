
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get auth token from request header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get the request body
    const requestData = await req.json();
    const { type, photo_url, display_name } = requestData;

    if (!type || (type === 'profile_photo' && !photo_url)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create the verification request
    const { data, error } = await supabaseClient
      .from('verification_requests')
      .insert({
        user_id: user.id,
        type,
        photo_url,
        user_display_name: display_name || user.email,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error creating verification request:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to create verification request', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification request created successfully',
        request_id: data.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
