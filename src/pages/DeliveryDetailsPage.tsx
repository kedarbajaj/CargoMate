
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatWeight, getDeliveryStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DeliveryInvoice from '@/components/invoice/DeliveryInvoice';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  weight_kg: number;
  scheduled_date: string;
  status: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  package_type: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (id && user) {
      const fetchDelivery = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          setDelivery(data);
          
          // Fetch user profile for invoice
          if (data.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name, email, phone')
              .eq('id', data.user_id)
              .single();
              
            if (userError) throw userError;
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching delivery:', error);
          toast.error('Failed to load delivery details');
        } finally {
          setLoading(false);
        }
      };

      fetchDelivery();
    }
  }, [id, user]);

  const revalidate = async () => {
    if (id && user) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDelivery(data);
      } catch (error) {
        console.error('Error revalidating delivery:', error);
        toast.error('Failed to refresh delivery details');
      }
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'in_transit' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Delivery accepted successfully');
      revalidate();
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error('Failed to accept delivery');
    }
  };

  const handleRejectDelivery = async () => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Delivery rejected successfully');
      revalidate();
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      toast.error('Failed to reject delivery');
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'delivered' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Delivery marked as completed');
      revalidate();
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    }
  };

  const handleDownloadInvoice = () => {
    const element = document.getElementById('invoice');
    if (!element) {
      toast.error('Could not generate invoice');
      return;
    }

    const opt = {
      margin: 10,
      filename: `cargomate-invoice-${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
    toast.success('Invoice downloaded successfully');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading delivery details...</div>;
  }

  if (!delivery) {
    return <div className="flex h-screen items-center justify-center">Delivery not found.</div>;
  }

  const invoiceData = delivery && userProfile ? {
    ...delivery,
    user: userProfile,
    amount: 0, // Will be calculated in the component
  } : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {!showInvoice ? (
        <>
          <div>
            <h1 className="text-2xl font-bold">Delivery Details</h1>
            <p className="text-muted-foreground">Details for delivery ID: {delivery.id}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
            <div className="grid gap-4">
              <div>
                <h2 className="text-lg font-semibold">Delivery Information</h2>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Pickup Address</span>
                  <p className="font-semibold">{delivery.pickup_address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Delivery Address</span>
                  <p className="font-semibold">{delivery.drop_address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Weight (kg)</span>
                  <p className="font-semibold">{formatWeight(delivery.weight_kg)} kg</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Package Type</span>
                  <p className="font-semibold capitalize">{delivery.package_type?.replace('_', ' ') || 'Standard'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <p>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                      {delivery.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Created At</span>
                  <p className="font-semibold">{formatDate(delivery.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Based on Status */}
          <div className="flex flex-wrap justify-end gap-2">
            {delivery.status === 'pending' && (
              <>
                <Button variant="destructive" onClick={handleRejectDelivery}>
                  Reject Delivery
                </Button>
                <Button variant="default" onClick={handleAcceptDelivery}>
                  Accept Delivery
                </Button>
              </>
            )}
            
            {delivery.status === 'in_transit' && (
              <Button variant="default" onClick={handleCompleteDelivery}>
                Mark as Delivered
              </Button>
            )}
            
            {delivery.status === 'delivered' && (
              <Button 
                variant="outline" 
                onClick={() => setShowInvoice(true)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" /> View Invoice
              </Button>
            )}
          </div>

          {/* Back to Deliveries */}
          <div className="mt-4">
            <Link to="/deliveries">
              <Button variant="secondary">Back to Deliveries</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={() => setShowInvoice(false)}>
              Back to Details
            </Button>
            <Button 
              variant="default" 
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
          
          {invoiceData && (
            <DeliveryInvoice invoiceData={invoiceData} />
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryDetailsPage;
