
// Define types for deliveries
export interface Delivery {
  id: string;
  user_id?: string;
  vendor_id?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_address?: string;
  drop_address?: string;
  weight_kg?: number;
  package_type?: string;
  created_at?: string;
  scheduled_date?: string;
  users?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  vendors?: {
    company_name?: string;
    email?: string;
    phone?: string;
  };
}

// Define types for payments
export interface Payment {
  id: string;
  delivery_id?: string;
  user_id?: string;
  amount?: number;
  payment_method?: string;
  status?: 'pending' | 'successful' | 'failed';
  created_at?: string;
}

// Define types for user profiles
export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  current_address?: string;
  pincode?: string;
}

// Define type for invoice data
export interface InvoiceData {
  id: string;
  created_at: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  pickup_address: string;
  drop_address: string;
  weight_kg: number;
  package_type: string;
  amount: number;
}

// Define type for feedback
export interface Feedback {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  feedback_type: 'general' | 'bug' | 'feature' | 'complaint' | 'praise';
  subject: string;
  message: string;
  created_at?: string;
}
