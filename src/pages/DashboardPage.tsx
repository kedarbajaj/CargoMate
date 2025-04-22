
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Interface for dashboard stats
interface DashboardStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  totalSpent: number;
}

// Interface for recent deliveries
interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  status: string;
  scheduled_date: string;
  created_at: string;
  weight_kg: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    totalSpent: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
          // Fetch user's deliveries
          const { data: deliveries, error: deliveriesError } = await supabase
            .from('deliveries')
            .select('*')
            .eq('user_id', user.id);

          if (deliveriesError) throw deliveriesError;

          // Fetch payments for total spent
          const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          if (paymentsError) throw paymentsError;

          // Calculate stats
          const pendingDeliveries = deliveries?.filter(d => d.status === 'pending').length || 0;
          const completedDeliveries = deliveries?.filter(d => d.status === 'delivered').length || 0;
          const totalSpent = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

          setStats({
            totalDeliveries: deliveries?.length || 0,
            pendingDeliveries,
            completedDeliveries,
            totalSpent,
          });

          // Set recent deliveries (last 5)
          setRecentDeliveries(
            deliveries
              ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5) || []
          );
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <StatCard
          title="Total Deliveries"
          value={stats.totalDeliveries.toString()}
          loading={loading}
          icon={<PackageIcon />}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries.toString()}
          loading={loading}
          icon={<ClockIcon />}
          color="bg-yellow-50 text-yellow-700"
        />
        <StatCard
          title="Completed Deliveries"
          value={stats.completedDeliveries.toString()}
          loading={loading}
          icon={<CheckmarkIcon />}
          color="bg-green-50 text-green-700"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          loading={loading}
          icon={<PaymentIcon />}
          color="bg-purple-50 text-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Recent Deliveries */}
        <div className="col-span-2 rounded-lg border bg-card text-card-foreground shadow">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Recent Deliveries</h2>
            <Link to="/deliveries">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100"></div>
                ))}
              </div>
            ) : recentDeliveries.length > 0 ? (
              <div className="space-y-4">
                {recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex flex-col rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{truncateAddress(delivery.pickup_address)} → {truncateAddress(delivery.drop_address)}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(delivery.scheduled_date || delivery.created_at)}
                        </p>
                      </div>
                      <div>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                          {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm">Weight: {delivery.weight_kg} kg</p>
                      <Link to={`/deliveries/${delivery.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500">No deliveries found</p>
                <Link to="/deliveries/new">
                  <Button className="mt-4" variant="cargomate">Schedule a Delivery</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card text-card-foreground shadow">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="flex flex-col gap-2 p-4">
            <Link to="/deliveries/new">
              <Button className="w-full justify-start" variant="cargomate">
                <PlusIcon className="mr-2 h-4 w-4" />
                Schedule New Delivery
              </Button>
            </Link>
            <Link to="/tracking">
              <Button className="w-full justify-start" variant="outline">
                <SearchIcon className="mr-2 h-4 w-4" />
                Track a Delivery
              </Button>
            </Link>
            <Link to="/payments">
              <Button className="w-full justify-start" variant="outline">
                <WalletIcon className="mr-2 h-4 w-4" />
                View Payments
              </Button>
            </Link>
            <Link to="/profile">
              <Button className="w-full justify-start" variant="outline">
                <UserIcon className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
          </div>
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
const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const PaymentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default DashboardPage;
