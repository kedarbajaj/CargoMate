
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
    const { deliveryId, amount, paymentMethod } = await req.json();

    if (!deliveryId || !amount || !paymentMethod) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client to bypass RLS
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the delivery exists and belongs to the user
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", deliveryId)
      .eq("user_id", user.id)
      .single();

    if (deliveryError || !delivery) {
      return new Response(JSON.stringify({ error: "Delivery not found or unauthorized" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // In a real-world scenario, integrate with a payment gateway here

    // For demo purposes, we'll simulate a payment
    const paymentStatus = Math.random() > 0.1 ? "completed" : "failed"; // 90% success rate

    // Record the payment
    const { data: payment, error: paymentError } = await adminSupabase
      .from("payments")
      .insert({
        delivery_id: deliveryId,
        user_id: user.id,
        amount,
        payment_method: paymentMethod,
        status: paymentStatus,
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Send notification
    const message = paymentStatus === "completed"
      ? `Your payment of ${amount} for delivery ${deliveryId.slice(0, 8)}... was successful.`
      : `Your payment for delivery ${deliveryId.slice(0, 8)}... failed. Please try again.`;
    
    await adminSupabase
      .from("notifications")
      .insert({
        user_id: user.id,
        message,
        status: "unread",
      });

    return new Response(JSON.stringify({ success: true, payment }), {
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
