
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
    
    // Get the current user and check if they're an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Check if the user is an admin
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('is_admin', {
      user_id: user.id
    });
    
    if (adminError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Not authorized, admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Get the request body
    const requestData = await req.json();
    const { type, status = 'pending' } = requestData;
    
    // Get verification requests
    const { data, error } = await supabaseClient
      .from('verification_requests')
      .select('*')
      .eq('type', type)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching verification requests:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch verification requests', details: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        requests: data 
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
