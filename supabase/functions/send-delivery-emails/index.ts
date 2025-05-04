
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
    const data = await req.json();
    const { 
      userId, 
      vendorId, 
      deliveryId, 
      packageType, 
      type,
      status,
      pickup,
      dropoff
    } = data;

    if (!type) {
      return new Response(JSON.stringify({ error: 'Missing required type parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize variables for email sending
    let userData = null;
    let vendorData = null;
    let delivery = null;
    let adminEmails = [];

    // Fetch delivery data if deliveryId is provided
    if (deliveryId) {
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .select('*, users:user_id(*), vendors:vendor_id(*)')
        .eq('id', deliveryId)
        .single();

      if (deliveryError) {
        console.error('Error fetching delivery data:', deliveryError);
      } else {
        delivery = deliveryData;
      }
    }

    // Fetch user data if userId is provided
    if (userId) {
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else {
        userData = userDataResult;
      }
    } else if (delivery?.user_id) {
      userData = delivery.users;
    }

    // Fetch vendor data if vendorId is provided
    if (vendorId) {
      const { data: vendorDataResult, error: vendorError } = await supabase
        .from('vendors')
        .select('company_name, email, phone')
        .eq('id', vendorId)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor data:', vendorError);
      } else {
        vendorData = vendorDataResult;
      }
    } else if (delivery?.vendor_id) {
      vendorData = delivery.vendors;
    }

    // Fetch admin data for admin notifications
    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'admin');

    if (!adminsError && admins) {
      adminEmails = admins.map(admin => admin.email);
    }

    // Process different email types
    let emailResults = [];
    
    switch (type) {
      case 'customer_confirmation':
        if (userData?.email) {
          console.log(`Sending delivery confirmation to customer: ${userData.email}`);
          // In a real app, this would use an email service
          emailResults.push({
            recipient: userData.email,
            subject: 'Your Delivery Has Been Scheduled',
            type: 'customer_confirmation',
            success: true
          });

          // Create notification for user
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              message: `Your delivery has been scheduled successfully. Tracking ID: ${deliveryId?.substring(0, 8)}`,
              status: 'unread'
            });
        }
        break;

      case 'vendor_new_delivery':
        if (vendorData?.email) {
          console.log(`Sending new delivery notification to vendor: ${vendorData.email}`);
          // In a real app, this would use an email service
          emailResults.push({
            recipient: vendorData.email,
            subject: 'New Delivery Assignment',
            type: 'vendor_new_delivery',
            success: true
          });

          // Create notification for vendor
          await supabase
            .from('notifications')
            .insert({
              user_id: vendorId,
              message: `New delivery assignment from ${pickup || delivery?.pickup_address} to ${dropoff || delivery?.drop_address}`,
              status: 'unread'
            });
        }
        break;

      case 'admin_new_delivery':
        for (const adminEmail of adminEmails) {
          console.log(`Sending new delivery notification to admin: ${adminEmail}`);
          // In a real app, this would use an email service
          emailResults.push({
            recipient: adminEmail,
            subject: 'New Delivery Created',
            type: 'admin_new_delivery',
            success: true
          });
        }

        // Create notifications for all admins
        if (admins?.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user_id: admin.id,
            message: `New delivery created: ${delivery?.id ? delivery.id.substring(0, 8) : 'ID unavailable'}`,
            status: 'unread'
          }));

          await supabase
            .from('notifications')
            .insert(adminNotifications);
        }
        break;

      case 'status_update':
        if (userData?.email && status) {
          console.log(`Sending status update to customer: ${userData.email}`);
          // In a real app, this would use an email service
          emailResults.push({
            recipient: userData.email,
            subject: `Delivery Status Update: ${status.toUpperCase()}`,
            type: 'status_update',
            success: true
          });

          // Create notification for user
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              message: `Your delivery status has been updated to ${status.toUpperCase()}`,
              status: 'unread'
            });
        }
        break;
        
      case 'vendor_action':
        const action = data.action || 'updated';
        const vendorName = data.vendorName || vendorData?.company_name || 'vendor';
        
        if (userData?.email) {
          console.log(`Sending vendor action notification to customer: ${userData.email}`);
          // In a real app, this would use an email service
          emailResults.push({
            recipient: userData.email,
            subject: `Delivery ${action.toUpperCase()} by ${vendorName}`,
            type: 'vendor_action',
            success: true
          });
            
          // Create notification for user
          await supabase
            .from('notifications')
            .insert({
              user_id: userId || delivery?.user_id,
              message: `Your delivery has been ${action} by ${vendorName}`,
              status: 'unread'
            });
        }
        
        // Also notify admins
        for (const adminEmail of adminEmails) {
          console.log(`Sending vendor action notification to admin: ${adminEmail}`);
          // In a real app, this would use an email service
          emailResults.push({
            recipient: adminEmail,
            subject: `Delivery ${action.toUpperCase()} by ${vendorName}`,
            type: 'admin_vendor_action',
            success: true
          });
        }
        
        // Create notifications for all admins
        if (admins?.length > 0) {
          const adminNotifications = admins.map(admin => ({
            user_id: admin.id,
            message: `Delivery ${delivery?.id ? delivery.id.substring(0, 8) : 'ID unavailable'} has been ${action} by vendor ${vendorName}`,
            status: 'unread'
          }));

          await supabase
            .from('notifications')
            .insert(adminNotifications);
        }
        break;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Emails and notifications processed successfully',
      results: emailResults
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
