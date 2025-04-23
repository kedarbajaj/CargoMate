
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
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface WelcomeEmailRequest {
  user_id: string;
  template_type: 'welcome_user' | 'welcome_vendor' | 'welcome_admin';
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
    const data: WelcomeEmailRequest = await req.json();
    const { user_id, template_type } = data;

    if (!user_id || !template_type) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email, role')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Fetch vendor data if applicable
    let vendorData = null;
    if (template_type === 'welcome_vendor') {
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('company_name')
        .eq('id', user_id)
        .single();
        
      if (!vendorError) {
        vendorData = vendor;
      }
    }

    // In a real app, you'd send actual emails here using services like SendGrid, Mailgun, or Resend
    // For this demo, we'll simulate the email by logging it
    
    console.log('Sending welcome email to:', userData.email);
    
    let emailContent = '';
    let emailSubject = '';
    
    switch (template_type) {
      case 'welcome_user':
        emailSubject = 'Welcome to CargoMate!';
        emailContent = `
          Hello ${userData.name},

          Welcome to CargoMate! Your account has been created successfully.
          
          You can now log in to your account and start scheduling deliveries.
          
          Thank you for choosing CargoMate!
          
          Best regards,
          The CargoMate Team
        `;
        break;
        
      case 'welcome_vendor':
        emailSubject = 'Welcome to CargoMate Vendor Portal!';
        emailContent = `
          Hello ${userData.name},

          Welcome to CargoMate! Your vendor account has been created successfully.
          
          Company: ${vendorData?.company_name || 'Not specified'}
          Role: Vendor
          
          You can now log in to your vendor dashboard to manage deliveries.
          
          Thank you for partnering with CargoMate!
          
          Best regards,
          The CargoMate Team
        `;
        break;
        
      case 'welcome_admin':
        emailSubject = 'Welcome to CargoMate Admin Portal!';
        emailContent = `
          Hello ${userData.name},

          Welcome to CargoMate! Your admin account has been created successfully.
          
          Role: Admin
          
          You can now log in to your admin dashboard to manage the platform.
          
          Thank you for being part of the CargoMate team!
          
          Best regards,
          The CargoMate Team
        `;
        break;
        
      default:
        emailSubject = 'Welcome to CargoMate!';
        emailContent = `
          Hello ${userData.name},

          Welcome to CargoMate! Your account has been created successfully.
          
          Thank you for choosing CargoMate!
          
          Best regards,
          The CargoMate Team
        `;
    }

    console.log('Email subject:', emailSubject);
    console.log('Email content:', emailContent);

    // Create notification record for user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        message: `Welcome to CargoMate as a ${userData.role}!`,
        status: 'unread'
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Return a successful response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email sent successfully',
      recipient: userData.email
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in send-welcome-email function:', error);
    
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
