
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
    // Get the authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      throw new Error('Missing authorization header');
    }

    // Create a Supabase client with the auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } }
    );

    // Get user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Error getting user');
    }

    // Get user nationality from the user_nationalities table
    const { data: nationalityData, error: nationalityError } = await supabase
      .from('user_nationalities')
      .select('nationality')
      .eq('user_id', user.id)
      .single();
    
    if (nationalityError) {
      console.log('Error fetching nationality:', nationalityError);
      // Fallback to the fixed function if we can't get the nationality
      const { data, error } = await supabase.rpc(
        'get_recommended_profiles_by_nationality_fixed',
        { p_user_id: user.id }
      );

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ recommendations: data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get recommended profiles based on nationality
    // We're using the mock function since we don't have real user data yet
    const { data, error } = await supabase.rpc(
      'get_recommended_profiles_by_nationality_fixed',
      { p_user_id: user.id }
    );

    if (error) {
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
