
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExternalNotificationRequest {
  userId: string;
  title: string;
  body: string;
  channel: "kakao" | "line";
  deepLink?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { userId, title, body, channel, deepLink }: ExternalNotificationRequest = await req.json();
    
    // Validate required fields
    if (!userId || !title || !body || !channel) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: userId, title, body, channel are all required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // In a real implementation, we would check user_channels table to see if the user has connected
    // this channel, and then call the appropriate API (Kakao or LINE)
    
    // For now, we'll just log the request and return a success response
    console.log(`Mock external notification to ${channel} for user ${userId}:`, {
      title,
      body,
      deepLink
    });
    
    // In a real implementation, we might add a record to a notifications_external_log table
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `External notification sent to ${channel} for user ${userId}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending external notification:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
