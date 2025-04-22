import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatWeight, getDeliveryStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
}

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading delivery details...</div>;
  }

  if (!delivery) {
    return <div className="flex h-screen items-center justify-center">Delivery not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
              <span className="text-sm font-medium text-muted-foreground">Scheduled Date</span>
              <p className="font-semibold">{formatDate(delivery.scheduled_date)}</p>
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

      {/* Actions (Conditionally Rendered Based on Status) */}
      {delivery.status === 'pending' && (
        <div className="flex justify-end space-x-2">
          <Button variant="cargoReject" onClick={handleRejectDelivery}>
            Reject Delivery
          </Button>
          <Button variant="cargoAccept" onClick={handleAcceptDelivery}>
            Accept Delivery
          </Button>
        </div>
      )}

      {/* Back to Deliveries */}
      <div className="mt-4">
        <Link to="/deliveries">
          <Button variant="secondary">Back to Deliveries</Button>
        </Link>
      </div>
    </div>
  );
};

export default DeliveryDetailsPage;
