
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body
    const { name, email, feedbackType, subject, message, rating, adminEmail } = await req.json();

    if (!name || !email || !feedbackType || !subject || !message || !adminEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store in notifications table
    await adminSupabase
      .from("notifications")
      .insert({
        user_id: null, // This is meant for admin notification
        message: `New ${feedbackType} feedback from ${name}: ${subject} (Rating: ${rating}/5)`,
        status: "unread",
      });

    // In a production environment, you would send an actual email here
    // using a service like SendGrid, Resend, or AWS SES
    console.log(`
      New feedback received:
      From: ${name} (${email})
      Type: ${feedbackType}
      Rating: ${rating}/5
      Subject: ${subject}
      Message: ${message}
      To: ${adminEmail}
    `);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Feedback submitted successfully and notification created"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending feedback email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
