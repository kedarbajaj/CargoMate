
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const { deliveryId, status, latitude, longitude, statusUpdate } = await req.json();

    if (!deliveryId || !status) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client to bypass RLS
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is authorized to update this delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", deliveryId)
      .single();

    if (deliveryError || !delivery) {
      return new Response(JSON.stringify({ error: "Delivery not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (delivery.vendor_id !== user.id && delivery.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized to update this delivery" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update delivery status
    const { data: updatedDelivery, error: updateError } = await adminSupabase
      .from("deliveries")
      .update({ status })
      .eq("id", deliveryId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Create tracking update if coordinates are provided
    if (latitude && longitude) {
      await adminSupabase
        .from("tracking_updates")
        .insert({
          delivery_id: deliveryId,
          latitude,
          longitude,
          status_update: statusUpdate || status,
        });
    }

    // Send notification to the user
    const message = `Your delivery status has been updated to ${status.toUpperCase()}.`;
    await adminSupabase
      .from("notifications")
      .insert({
        user_id: delivery.user_id,
        message,
        status: "unread",
      });

    return new Response(JSON.stringify({ success: true, delivery: updatedDelivery }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
