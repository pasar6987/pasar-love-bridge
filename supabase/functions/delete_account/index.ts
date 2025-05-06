
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is deprecated, redirect to delete-user-account
  return new Response(
    JSON.stringify({ 
      error: 'This function is deprecated. Please use the delete-user-account function instead.' 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 301
    }
  );
});
