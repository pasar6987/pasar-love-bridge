
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateNotificationRequest {
  userId: string;
  type: "match_accepted" | "match_rejected" | "new_message" | "verify_passed" | "verify_rejected";
  title: string;
  body: string;
  relatedId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { userId, type, title, body, relatedId }: CreateNotificationRequest = await req.json();
    
    // Validate required fields
    if (!userId || !type || !title || !body) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: userId, type, title, body are all required" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }
    
    // Create the notification
    const { data, error } = await supabase.rpc('create_admin_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_body: body,
      p_related_id: relatedId
    });
    
    if (error) {
      throw error;
    }
    
    console.log("Created notification:", data);
    
    return new Response(
      JSON.stringify({ success: true, notificationId: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
