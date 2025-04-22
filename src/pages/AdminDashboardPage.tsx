
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalDeliveries: number;
  activeDeliveries: number;
}

interface RecentDelivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  status: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  vendor: {
    company_name: string;
  };
}

// Interface for icon props
interface IconProps {
  className?: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalDeliveries: 0,
    activeDeliveries: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user && isAdmin) {
      const fetchAdminData = async () => {
        setLoading(true);
        try {
          const { count: usersCount, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user');

          if (usersError) throw usersError;

          const { count: vendorsCount, error: vendorsError } = await supabase
            .from('vendors')
            .select('*', { count: 'exact', head: true });

          if (vendorsError) throw vendorsError;

          const { count: deliveriesCount, error: deliveriesError } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true });

          if (deliveriesError) throw deliveriesError;

          const { count: activeDeliveriesCount, error: activeError } = await supabase
            .from('deliveries')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'in_transit'] as any);

          if (activeError) throw activeError;

          setStats({
            totalUsers: usersCount || 0,
            totalVendors: vendorsCount || 0,
            totalDeliveries: deliveriesCount || 0,
            activeDeliveries: activeDeliveriesCount || 0,
          });

          const { data: recentData, error: recentError } = await supabase
            .from('deliveries')
            .select(`
              id,
              pickup_address,
              drop_address,
              status,
              created_at,
              users!deliveries_user_id_fkey (name, email),
              vendors!deliveries_vendor_id_fkey (company_name)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

          if (recentError) throw recentError;

          const formattedDeliveries = recentData?.map(delivery => ({
            id: delivery.id,
            pickup_address: delivery.pickup_address,
            drop_address: delivery.drop_address,
            status: delivery.status,
            created_at: delivery.created_at,
            user: {
              name: delivery.users?.name || 'Unknown',
              email: delivery.users?.email || 'No email',
            },
            vendor: {
              company_name: delivery.vendors?.company_name || 'Unknown',
            },
          })) || [];

          setRecentDeliveries(formattedDeliveries);
        } catch (error) {
          console.error('Error fetching admin data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchAdminData();
    }
  }, [user, isAdmin]);

  const filteredDeliveries = recentDeliveries.filter(delivery => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      delivery.pickup_address?.toLowerCase().includes(query) ||
      delivery.drop_address?.toLowerCase().includes(query) ||
      delivery.user.name?.toLowerCase().includes(query) ||
      delivery.user.email?.toLowerCase().includes(query) ||
      delivery.vendor.company_name?.toLowerCase().includes(query)
    );
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to access the admin dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toString()}
          loading={loading}
          icon={<UsersIcon className="h-5 w-5" />}
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          title="Total Vendors"
          value={stats.totalVendors.toString()}
          loading={loading}
          icon={<BuildingIcon className="h-5 w-5" />}
          color="bg-purple-50 text-purple-700"
        />
        <StatCard
          title="Total Deliveries"
          value={stats.totalDeliveries.toString()}
          loading={loading}
          icon={<BoxIcon className="h-5 w-5" />}
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="Active Deliveries"
          value={stats.activeDeliveries.toString()}
          loading={loading}
          icon={<TruckIcon className="h-5 w-5" />}
          color="bg-green-50 text-green-700"
        />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Recent Deliveries</h2>
        </div>

        <div className="p-4">
          <Input
            placeholder="Search deliveries by address, user, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : filteredDeliveries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50 text-left text-sm font-medium">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">ID</th>
                    <th className="whitespace-nowrap px-4 py-3">User</th>
                    <th className="whitespace-nowrap px-4 py-3">Vendor</th>
                    <th className="whitespace-nowrap px-4 py-3">Route</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3">Date</th>
                    <th className="whitespace-nowrap px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                        {delivery.id.slice(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <div className="font-medium">{delivery.user.name}</div>
                        <div className="text-xs text-muted-foreground">{delivery.user.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {delivery.vendor.company_name}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm">
                        {truncateAddress(delivery.pickup_address)} → {truncateAddress(delivery.drop_address)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                          {formatStatus(delivery.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {formatDate(delivery.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <Link to={`/deliveries/${delivery.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No deliveries found</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ActionCard
          title="Manage Users"
          description="View and manage user accounts"
          icon={<UsersIcon className="h-5 w-5" />}
          buttonText="View Users"
          buttonLink="/admin/users"
        />
        <ActionCard
          title="Manage Vendors"
          description="Add and configure vendor accounts"
          icon={<BuildingIcon className="h-5 w-5" />}
          buttonText="View Vendors"
          buttonLink="/admin/vendors"
        />
        <ActionCard
          title="System Settings"
          description="Configure application settings"
          icon={<SettingsIcon className="h-5 w-5" />}
          buttonText="Settings"
          buttonLink="/admin/settings"
        />
      </div>
    </div>
  );
};

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

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonLink: string;
}

const ActionCard = ({ title, description, icon, buttonText, buttonLink }: ActionCardProps) => (
  <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
      {icon}
    </div>
    <h3 className="mb-2 text-lg font-medium">{title}</h3>
    <p className="mb-4 text-sm text-muted-foreground">{description}</p>
    <Link to={buttonLink}>
      <Button variant="outline" className="w-full">
        {buttonText}
      </Button>
    </Link>
  </div>
);

const truncateAddress = (address?: string) => {
  if (!address) return 'N/A';
  return address.length > 15 ? `${address.substring(0, 15)}...` : address;
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BuildingIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);

const BoxIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const TruckIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
    <path d="M10 17h4V5H2v12h3" />
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
    <path d="M14 17h1" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const SettingsIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default AdminDashboardPage;
