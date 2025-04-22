
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  status: string;
  scheduled_date: string;
  created_at: string;
  weight_kg: number;
}

interface DashboardStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  inTransitDeliveries: number;
  completedDeliveries: number;
}

const VendorDashboardPage: React.FC = () => {
  const { user, isVendor } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    completedDeliveries: 0,
  });
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([]);
  const [inTransitDeliveries, setInTransitDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isVendor) {
      const fetchVendorData = async () => {
        setLoading(true);
        try {
          // Fetch all deliveries for this vendor
          const { data: deliveries, error: deliveriesError } = await supabase
            .from('deliveries')
            .select('*')
            .eq('vendor_id', user.id)
            .order('created_at', { ascending: false });

          if (deliveriesError) throw deliveriesError;

          // Calculate stats
          const pending = deliveries?.filter(d => d.status === 'pending') || [];
          const inTransit = deliveries?.filter(d => d.status === 'in_transit') || [];
          const completed = deliveries?.filter(d => d.status === 'delivered') || [];

          setStats({
            totalDeliveries: deliveries?.length || 0,
            pendingDeliveries: pending.length,
            inTransitDeliveries: inTransit.length,
            completedDeliveries: completed.length,
          });

          // Set pending and in-transit deliveries
          setPendingDeliveries(pending.slice(0, 3));
          setInTransitDeliveries(inTransit.slice(0, 3));
        } catch (error) {
          console.error('Error fetching vendor data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchVendorData();
    }
  }, [user, isVendor]);

  if (!isVendor) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to access the vendor dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground">Manage your delivery operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Deliveries"
          value={stats.totalDeliveries.toString()}
          loading={loading}
          icon={<BoxIcon />}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingDeliveries.toString()}
          loading={loading}
          icon={<ClockIcon />}
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransitDeliveries.toString()}
          loading={loading}
          icon={<TruckIcon />}
          color="bg-indigo-50 text-indigo-700"
        />
        <StatCard
          title="Completed"
          value={stats.completedDeliveries.toString()}
          loading={loading}
          icon={<CheckIcon />}
          color="bg-green-50 text-green-700"
        />
      </div>

      {/* Pending Approvals Section */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">Pending Approvals</h2>
          <Link to="/vendor-deliveries?status=pending">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100"></div>
              ))}
            </div>
          ) : pendingDeliveries.length > 0 ? (
            <div className="space-y-3">
              {pendingDeliveries.map((delivery) => (
                <Link to={`/deliveries/${delivery.id}`} key={delivery.id}>
                  <div className="flex flex-col rounded-md border p-3 transition-all hover:border-cargomate-300 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{truncateAddress(delivery.pickup_address)} → {truncateAddress(delivery.drop_address)}</p>
                      <p className="text-sm text-gray-500">
                        Scheduled: {formatDate(delivery.scheduled_date || delivery.created_at)}
                      </p>
                    </div>
                    <div className="mt-2 flex gap-2 sm:mt-0">
                      <Button size="sm" variant="cargoAccept">Accept</Button>
                      <Button size="sm" variant="cargoReject">Reject</Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No pending approvals</p>
            </div>
          )}
        </div>
      </div>

      {/* In Transit Deliveries */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-semibold">In Transit Deliveries</h2>
          <Link to="/vendor-deliveries?status=in_transit">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        <div className="p-2">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100"></div>
              ))}
            </div>
          ) : inTransitDeliveries.length > 0 ? (
            <div className="space-y-3">
              {inTransitDeliveries.map((delivery) => (
                <Link to={`/deliveries/${delivery.id}`} key={delivery.id}>
                  <div className="flex flex-col rounded-md border p-3 transition-all hover:border-cargomate-300 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{truncateAddress(delivery.pickup_address)} → {truncateAddress(delivery.drop_address)}</p>
                      <p className="text-sm text-gray-500">
                        Scheduled: {formatDate(delivery.scheduled_date || delivery.created_at)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDeliveryStatusColor('in_transit')}`}>
                        In Transit
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No deliveries in transit</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row">
          <Link to="/vendor-deliveries?status=pending" className="flex-1">
            <Button className="w-full" variant="cargomate">
              View All Pending Approvals
            </Button>
          </Link>
          <Link to="/vendor-deliveries" className="flex-1">
            <Button className="w-full" variant="outline">
              View All Deliveries
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard = ({ title, value, icon, color, loading = false }: StatCardProps) => (
  <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
    <div className="flex items-center gap-4">
      <div className={`rounded-full p-2 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {loading ? (
          <div className="mt-1 h-6 w-16 animate-pulse rounded bg-gray-200"></div>
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
    </div>
  </div>
);

// Helper function to truncate address
const truncateAddress = (address?: string) => {
  if (!address) return 'N/A';
  return address.length > 15 ? `${address.substring(0, 15)}...` : address;
};

// Icons
const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default VendorDashboardPage;
