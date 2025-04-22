import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  status: string;
  scheduled_date: string;
  created_at: string;
  weight_kg: number;
  user_id: string;
  vendor_id: string;
}

interface Vendor {
  id: string;
  company_name: string;
  email: string;
  phone: string;
}

interface TrackingUpdate {
  id: string;
  delivery_id: string;
  status_update: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
}

type DeliveryStatus = Database['public']['Enums']['delivery_status'];
type TrackingUpdateStatus = Database['public']['Enums']['delivery_update_status'];

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isVendor } = useAuth();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    const fetchDeliveryDetails = async () => {
      setLoading(true);
      try {
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('deliveries')
          .select('*')
          .eq('id', id)
          .single();

        if (deliveryError) throw deliveryError;
        setDelivery(deliveryData);

        if (deliveryData.vendor_id) {
          const { data: vendorData, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', deliveryData.vendor_id)
            .single();

          if (vendorError) throw vendorError;
          setVendor(vendorData);
        }

        const { data: trackingData, error: trackingError } = await supabase
          .from('tracking_updates')
          .select('*')
          .eq('delivery_id', id)
          .order('updated_at', { ascending: false });

        if (trackingError) throw trackingError;
        setTrackingUpdates(trackingData || []);
      } catch (error) {
        console.error('Error fetching delivery details:', error);
        toast.error('Failed to load delivery details');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [id, user]);

  const handleStatusUpdate = async (newStatus: DeliveryStatus) => {
    if (!delivery || !user) return;
    
    setActionLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', delivery.id);

      if (updateError) throw updateError;

      let trackingStatus: TrackingUpdateStatus;
      switch(newStatus) {
        case 'in_transit':
          trackingStatus = 'In Transit';
          break;
        case 'delivered':
          trackingStatus = 'Delivered';
          break;
        default:
          trackingStatus = 'Dispatched';
      }

      const { error: trackingError } = await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: delivery.id,
          status_update: trackingStatus,
          latitude: null,
          longitude: null,
        });

      if (trackingError) throw trackingError;

      await supabase.from('notifications').insert({
        user_id: delivery.user_id,
        message: `Your delivery #${delivery.id.slice(0, 8)} status has been updated to ${formatStatus(newStatus)}.`,
        status: 'unread',
      });

      setDelivery({
        ...delivery,
        status: newStatus,
      });

      const { data: trackingData } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('delivery_id', delivery.id)
        .order('updated_at', { ascending: false });

      setTrackingUpdates(trackingData || []);

      toast.success(`Delivery status updated to ${formatStatus(newStatus)}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelDelivery = async () => {
    if (!delivery || !user) return;

    setActionLoading(true);
    try {
      await handleStatusUpdate('cancelled');
    } catch (error) {
      console.error('Error cancelling delivery:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-32 w-32 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Delivery not found</h2>
        <Button
          onClick={() => navigate('/deliveries')}
          variant="outline"
          className="mt-4"
        >
          Back to Deliveries
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Delivery Details</h1>
          <p className="text-muted-foreground">ID: {delivery.id}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/deliveries')}
          >
            Back to Deliveries
          </Button>
          
          {user?.id === delivery.user_id && delivery.status === 'pending' && (
            <Button
              variant="destructive"
              onClick={cancelDelivery}
              disabled={actionLoading}
            >
              Cancel Delivery
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
          <h2 className="mb-4 text-lg font-semibold">Delivery Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                {formatStatus(delivery.status)}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Pickup Address</h3>
              <p className="mt-1">{delivery.pickup_address}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Delivery Address</h3>
              <p className="mt-1">{delivery.drop_address}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Package Weight</h3>
              <p className="mt-1">{delivery.weight_kg} kg</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Scheduled Date</h3>
              <p className="mt-1">{formatDate(delivery.scheduled_date || delivery.created_at)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
              <p className="mt-1">{formatDate(delivery.created_at)}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
          <h2 className="mb-4 text-lg font-semibold">Vendor Information</h2>
          
          {vendor ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Company Name</h3>
                <p className="mt-1">{vendor.company_name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="mt-1">{vendor.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p className="mt-1">{vendor.phone || 'N/A'}</p>
              </div>
              
              {isVendor && user?.id === delivery.vendor_id && delivery.status === 'pending' && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium">Vendor Actions</h3>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button
                      variant="cargoAccept"
                      onClick={() => handleStatusUpdate('accepted')}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      Accept Delivery
                    </Button>
                    <Button
                      variant="cargoReject"
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      Reject Delivery
                    </Button>
                  </div>
                </div>
              )}
              
              {isVendor && user?.id === delivery.vendor_id && delivery.status === 'accepted' && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium">Update Status</h3>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button
                      variant="cargomate"
                      onClick={() => handleStatusUpdate('in_transit')}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      Mark as In Transit
                    </Button>
                  </div>
                </div>
              )}
              
              {isVendor && user?.id === delivery.vendor_id && delivery.status === 'in_transit' && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-medium">Update Status</h3>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button
                      variant="cargomate"
                      onClick={() => handleStatusUpdate('delivered')}
                      disabled={actionLoading}
                      className="flex-1"
                    >
                      Mark as Delivered
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Vendor information not available</p>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
        <h2 className="mb-4 text-lg font-semibold">Tracking History</h2>
        
        {trackingUpdates.length > 0 ? (
          <div className="relative space-y-6">
            <div className="absolute left-3.5 top-0 bottom-0 h-full w-px bg-gray-200"></div>
            
            {trackingUpdates.map((update, index) => (
              <div key={update.id} className="relative flex gap-4">
                <div className={`relative z-10 mt-1 h-2 w-2 rounded-full ${index === 0 ? 'bg-cargomate-500' : 'bg-gray-300'}`}></div>
                <div>
                  <p className="font-medium">{formatStatus(update.status_update)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(update.updated_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No tracking updates available yet.</p>
        )}
      </div>
    </div>
  );
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

export default DeliveryDetailsPage;
