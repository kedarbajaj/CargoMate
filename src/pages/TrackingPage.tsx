
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { toast } from 'sonner';

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  status: string;
  scheduled_date: string;
  created_at: string;
  weight_kg: number;
}

interface TrackingUpdate {
  id: string;
  delivery_id: string;
  status_update: string;
  latitude: number | null;
  longitude: number | null;
  updated_at: string;
}

const TrackingPage: React.FC = () => {
  const { user } = useAuth();
  const [trackingId, setTrackingId] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!trackingId) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Fetch delivery details
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('id', trackingId)
        .single();

      if (deliveryError) throw deliveryError;

      // Check if this user has permission to view this delivery
      if (user && user.id !== deliveryData.user_id && user.id !== deliveryData.vendor_id) {
        // For security, we don't want to reveal that the ID exists but the user doesn't have access
        throw new Error('Delivery not found');
      }

      setDelivery(deliveryData);

      // Fetch tracking updates
      const { data: trackingData, error: trackingError } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('delivery_id', trackingId)
        .order('updated_at', { ascending: false });

      if (trackingError) throw trackingError;
      setTrackingUpdates(trackingData || []);
    } catch (error) {
      console.error('Error fetching tracking information:', error);
      setDelivery(null);
      setTrackingUpdates([]);
      toast.error('Delivery not found', {
        description: 'Please check the tracking ID and try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track Your Delivery</h1>
        <p className="text-muted-foreground">Enter your tracking ID to see the status of your delivery</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Enter tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          variant="cargomate" 
          disabled={loading || !trackingId}
          className="sm:w-auto"
        >
          {loading ? 'Searching...' : 'Track Delivery'}
        </Button>
      </div>

      {/* Tracking Results */}
      {searched && !loading && (
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          {delivery ? (
            <div className="space-y-6 p-6">
              {/* Delivery Status */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold">Delivery Status</h2>
                  <p className="text-sm text-muted-foreground">ID: {delivery.id}</p>
                </div>
                <div className={`rounded-full px-4 py-2 text-sm font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                  {formatStatus(delivery.status)}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-medium">Pickup Location</h3>
                  <p className="text-sm">{delivery.pickup_address}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Delivery Location</h3>
                  <p className="text-sm">{delivery.drop_address}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-medium">Scheduled Date</h3>
                  <p className="text-sm">{formatDate(delivery.scheduled_date || delivery.created_at)}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Created Date</h3>
                  <p className="text-sm">{formatDate(delivery.created_at)}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Package Weight</h3>
                  <p className="text-sm">{delivery.weight_kg} kg</p>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div>
                <h3 className="mb-4 font-medium">Tracking Timeline</h3>
                
                <div className="relative space-y-6">
                  {/* Timeline line */}
                  <div className="absolute left-3.5 top-0 bottom-0 h-full w-px bg-gray-200"></div>
                  
                  {trackingUpdates.length > 0 ? (
                    trackingUpdates.map((update, index) => (
                      <div key={update.id} className="relative flex gap-4">
                        {/* Timeline point */}
                        <div className={`relative z-10 mt-1 h-2 w-2 rounded-full ${index === 0 ? 'bg-cargomate-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className="font-medium">{formatStatus(update.status_update)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(update.updated_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-muted-foreground">No tracking updates available yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-400">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <h2 className="text-xl font-semibold">Delivery Not Found</h2>
              <p className="mt-2 max-w-md text-muted-foreground">
                We couldn't find a delivery with that tracking ID. Please double-check the ID and try again.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tracking Graphic */}
      {!searched && (
        <div className="flex items-center justify-center py-10">
          <div className="max-w-sm rounded-lg border bg-card p-8 text-card-foreground shadow">
            <div className="mb-6 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cargomate-500">
                <path d="M10 17h4V5H2v12h3" />
                <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
                <path d="M14 17h1" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </svg>
            </div>
            <h2 className="mb-2 text-center text-xl font-medium">Track Any Delivery</h2>
            <p className="text-center text-muted-foreground">
              Enter your tracking ID above to get real-time updates on your delivery.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format status
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

export default TrackingPage;
