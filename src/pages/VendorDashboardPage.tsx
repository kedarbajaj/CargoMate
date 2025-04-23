
import React, { useEffect, useState } from "react";
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Clock, Check, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  weight_kg: number;
  status: string;
  created_at: string;
  package_type: string;
}

interface VendorStats {
  pending: number;
  in_transit: number;
  delivered: number;
  cancelled: number;
}

const VendorDashboardPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<VendorStats>({
    pending: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDeliveries = async () => {
        setLoading(true);
        try {
          // For vendors, fetch assigned deliveries
          const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('vendor_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          if (data) {
            setDeliveries(data as Delivery[]);
            
            // Calculate stats
            const newStats = data.reduce((acc: VendorStats, delivery) => {
              const status = delivery.status || 'pending';
              acc[status as keyof VendorStats] = (acc[status as keyof VendorStats] || 0) + 1;
              return acc;
            }, {
              pending: 0,
              in_transit: 0,
              delivered: 0,
              cancelled: 0
            });
            
            setStats(newStats);
          }
        } catch (error) {
          console.error('Error fetching vendor deliveries:', error);
          toast.error('Failed to load deliveries');
        } finally {
          setLoading(false);
        }
      };

      fetchDeliveries();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'in_transit':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome{userProfile?.name ? `, ${userProfile.name}` : ''}! Manage your delivery operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.in_transit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Manage your assigned deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : deliveries.length > 0 ? (
            <div className="space-y-4">
              {deliveries.slice(0, 5).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(delivery.status)}
                    <div>
                      <h4 className="font-semibold">
                        {delivery.pickup_address.substring(0, 20)}... → {delivery.drop_address.substring(0, 20)}...
                      </h4>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>Weight: {delivery.weight_kg} kg</span>
                        <span>•</span>
                        <span>Type: {delivery.package_type || 'Standard'}</span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/deliveries/${delivery.id}`}>
                    <Button variant="outline" size="sm">
                      Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
              
              {deliveries.length > 5 && (
                <div className="flex justify-center pt-2">
                  <Link to="/deliveries">
                    <Button variant="outline">View All Deliveries</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <h3 className="mt-2 text-lg font-medium">No deliveries assigned yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Deliveries assigned to you will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboardPage;
