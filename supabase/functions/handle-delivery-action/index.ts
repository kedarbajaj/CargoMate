
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

interface DeliveryActionRequest {
  deliveryId: string;
  action: 'accept' | 'reject';
  vendorId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create Supabase client with auth header
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse the request body
    const { deliveryId, action, vendorId } = await req.json() as DeliveryActionRequest;

    if (!deliveryId || !action || !vendorId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify that the authenticated user is the vendor
    if (user.id !== vendorId) {
      return new Response(JSON.stringify({ error: 'Not authorized for this vendor' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get the delivery details
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('*, users:user_id(name, email)')
      .eq('id', deliveryId)
      .single();

    if (deliveryError || !delivery) {
      return new Response(JSON.stringify({ error: 'Delivery not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Verify that this delivery is assigned to the vendor
    if (delivery.vendor_id !== vendorId) {
      return new Response(JSON.stringify({ error: 'This delivery is not assigned to you' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('company_name')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return new Response(JSON.stringify({ error: 'Vendor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Update the delivery status based on action
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { error: updateError } = await supabase
      .from('deliveries')
      .update({ status: newStatus })
      .eq('id', deliveryId);

    if (updateError) {
      throw updateError;
    }

    // Create notification for the user
    const notification = {
      user_id: delivery.user_id,
      message: `Your delivery from ${delivery.pickup_address} to ${delivery.drop_address} has been ${newStatus} by ${vendor.company_name}.`,
      status: 'unread',
    };

    await supabase.from('notifications').insert(notification);

    // In a real app, send an email to the user
    console.log(`Sending email to user ${delivery.users?.email} about delivery ${action}`);
    console.log(`Email content: Your delivery from ${delivery.pickup_address} to ${delivery.drop_address} has been ${newStatus} by ${vendor.company_name}.`);

    return new Response(JSON.stringify({ 
      success: true,
      status: newStatus,
      message: `Delivery successfully ${newStatus}`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in handle-delivery-action:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
