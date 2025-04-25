
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Set up CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DeliveryEmailRequest {
  delivery: {
    id: string;
    pickup_address: string;
    drop_address: string;
    scheduled_date: string;
    weight_kg: number;
    status: string;
    package_type: string;
  };
  user_id: string;
  vendor_id: string;
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
    // Parse the request body as JSON
    const data: DeliveryEmailRequest = await req.json();
    const { delivery, user_id, vendor_id } = data;

    if (!delivery || !user_id || !vendor_id) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch vendor data
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('company_name, email')
      .eq('id', vendor_id)
      .single();

    if (vendorError || !vendorData) {
      console.error('Error fetching vendor data:', vendorError);
      return new Response(JSON.stringify({ error: 'Vendor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Format the scheduled date for display
    const scheduledDate = new Date(delivery.scheduled_date).toLocaleString();
    
    // Calculate estimated price based on weight and package type
    const baseRate = 100; // Base rate in INR
    const weightFactor = delivery.weight_kg * 10; // 10 INR per kg
    
    // Package type multipliers
    const packageMultiplier = {
      'standard': 1,
      'handle_with_care': 1.2,
      'fragile': 1.5,
      'oversized': 2
    };
    
    let multiplier = 1;
    if (delivery.package_type in packageMultiplier) {
      multiplier = packageMultiplier[delivery.package_type as keyof typeof packageMultiplier];
    }
    
    const estimatedPrice = Math.round(baseRate + weightFactor) * multiplier;
    
    // In a real app, you'd send actual emails here using services like SendGrid, Mailgun, or Resend
    // For this demo, we'll simulate the email by logging it
    console.log('Sending email to user:', userData.email);
    console.log('User email content:', `
      Hello ${userData.name},

      Your delivery has been scheduled successfully!

      Delivery ID: ${delivery.id}
      Pickup: ${delivery.pickup_address}
      Delivery: ${delivery.drop_address}
      Scheduled Date: ${scheduledDate}
      Weight: ${delivery.weight_kg} kg
      Package Type: ${delivery.package_type}
      Estimated Price: ₹${estimatedPrice.toFixed(2)}
      Status: ${delivery.status}
      
      You can track your delivery at any time by visiting the tracking page.
      A payment link has been created and you can complete the payment from your account.

      Thank you for using CargoMate!
    `);

    console.log('Sending email to vendor:', vendorData.email);
    console.log('Vendor email content:', `
      Hello ${vendorData.company_name},

      A new delivery has been assigned to your company!

      Delivery ID: ${delivery.id}
      Pickup: ${delivery.pickup_address}
      Delivery: ${delivery.drop_address}
      Scheduled Date: ${scheduledDate}
      Weight: ${delivery.weight_kg} kg
      Package Type: ${delivery.package_type}
      
      Please log in to your vendor dashboard to accept or reject this delivery.

      Thank you for your partnership with CargoMate!
    `);

    // Create notification records for user and vendor
    const userNotification = {
      user_id,
      message: `Your delivery from ${delivery.pickup_address} to ${delivery.drop_address} has been scheduled. Estimated price: ₹${estimatedPrice.toFixed(2)}`,
      status: 'unread'
    };

    const vendorNotification = {
      user_id: vendor_id,
      message: `New delivery request: From ${delivery.pickup_address} to ${delivery.drop_address}.`,
      status: 'unread'
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([userNotification, vendorNotification]);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
    }

    // Return a successful response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Delivery emails sent successfully',
      recipients: [userData.email, vendorData.email],
      estimatedPrice
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in send-delivery-emails function:', error);
    
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
