
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
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

// Interface for icon props
interface IconProps {
  className?: string;
}

const DeliveriesPage: React.FC = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      const fetchDeliveries = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setDeliveries(data || []);
          setFilteredDeliveries(data || []);
        } catch (error) {
          console.error('Error fetching deliveries:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchDeliveries();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...deliveries];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        delivery =>
          delivery.pickup_address?.toLowerCase().includes(query) ||
          delivery.drop_address?.toLowerCase().includes(query)
      );
    }
    
    setFilteredDeliveries(filtered);
  }, [searchQuery, statusFilter, deliveries]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Your Deliveries</h1>
        <Link to="/deliveries/new">
          <Button variant="cargomate">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Delivery
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search by address..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex w-full gap-2 md:w-1/3">
          <StatusFilterButton
            status="all"
            currentFilter={statusFilter}
            onClick={handleStatusFilterChange}
            label="All"
          />
          <StatusFilterButton
            status="pending"
            currentFilter={statusFilter}
            onClick={handleStatusFilterChange}
            label="Pending"
          />
          <StatusFilterButton
            status="in_transit"
            currentFilter={statusFilter}
            onClick={handleStatusFilterChange}
            label="In Transit"
          />
          <StatusFilterButton
            status="delivered"
            currentFilter={statusFilter}
            onClick={handleStatusFilterChange}
            label="Delivered"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-md border bg-gray-50"></div>
          ))}
        </div>
      ) : filteredDeliveries.length > 0 ? (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <Link to={`/deliveries/${delivery.id}`} key={delivery.id}>
              <div className="flex flex-col rounded-lg border p-4 hover:border-cargomate-300 hover:bg-gray-50 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {truncateAddress(delivery.pickup_address)} → {truncateAddress(delivery.drop_address)}
                    </h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                      {formatStatus(delivery.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Scheduled: {formatDate(delivery.scheduled_date || delivery.created_at)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Weight: {delivery.weight_kg} kg
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2 md:mt-0">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <PackageIcon className="h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium">No deliveries found</h3>
          <p className="mt-2 text-center text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? "No deliveries match your search criteria. Try adjusting your filters."
              : "You haven't scheduled any deliveries yet."}
          </p>
          <Link to="/deliveries/new">
            <Button className="mt-4" variant="cargomate">
              Schedule Your First Delivery
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

interface StatusFilterButtonProps {
  status: string;
  currentFilter: string;
  onClick: (status: string) => void;
  label: string;
}

const StatusFilterButton = ({ status, currentFilter, onClick, label }: StatusFilterButtonProps) => (
  <Button
    variant={currentFilter === status ? "cargomate" : "outline"}
    size="sm"
    onClick={() => onClick(status)}
    className="flex-1"
  >
    {label}
  </Button>
);

const truncateAddress = (address?: string) => {
  if (!address) return 'N/A';
  return address.length > 20 ? `${address.substring(0, 20)}...` : address;
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2 h-4 w-4"}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const PackageIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "h-5 w-5"}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

export default DeliveriesPage;
