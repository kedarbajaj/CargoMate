
import { supabase } from "@/integrations/supabase/client";

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  try {
    // Call our Supabase function to send welcome email
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { email, name, role }
    });
    
    if (error) throw error;
    console.log(`Welcome email sent to ${email} (${role})`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendDeliveryConfirmation(userId: string, deliveryId: string, packageType: string) {
  try {
    // Call our Supabase function to send delivery confirmation email
    const { data, error } = await supabase.functions.invoke('send-delivery-emails', {
      body: { 
        userId, 
        deliveryId, 
        packageType,
        type: 'customer_confirmation' 
      }
    });
    
    if (error) throw error;
    console.log(`Delivery confirmation sent for delivery ${deliveryId}`);
    return true;
  } catch (error) {
    console.error('Error sending delivery confirmation:', error);
    return false;
  }
}

export async function notifyVendorNewDelivery(vendorId: string, deliveryId: string, pickup: string, dropoff: string) {
  try {
    // Call our Supabase function to notify vendor about new delivery
    const { data, error } = await supabase.functions.invoke('send-delivery-emails', {
      body: { 
        vendorId, 
        deliveryId,
        pickup,
        dropoff,
        type: 'vendor_new_delivery' 
      }
    });
    
    if (error) throw error;
    console.log(`Vendor notification sent for delivery ${deliveryId}`);
    return true;
  } catch (error) {
    console.error('Error notifying vendor:', error);
    return false;
  }
}

export async function notifyAdminNewDelivery(deliveryId: string, userId: string, vendorId: string) {
  try {
    // Call our Supabase function to notify admin about new delivery
    const { data, error } = await supabase.functions.invoke('send-delivery-emails', {
      body: { 
        deliveryId,
        userId,
        vendorId,
        type: 'admin_new_delivery' 
      }
    });
    
    if (error) throw error;
    console.log(`Admin notification sent for delivery ${deliveryId}`);
    return true;
  } catch (error) {
    console.error('Error notifying admin:', error);
    return false;
  }
}

export async function sendDeliveryStatusUpdate(userId: string, deliveryId: string, status: string) {
  try {
    // Call our Supabase function to send status update email
    const { data, error } = await supabase.functions.invoke('send-delivery-emails', {
      body: { 
        userId, 
        deliveryId, 
        status,
        type: 'status_update' 
      }
    });
    
    if (error) throw error;
    console.log(`Status update email sent for delivery ${deliveryId}`);
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
}
