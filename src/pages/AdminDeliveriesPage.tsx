
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, TruckIcon, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Delivery } from '@/types/delivery';

const AdminDeliveriesPage = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deliveries')
        .select('*, users!inner(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure proper typing for status
      const typedDeliveries: Delivery[] = (data || []).map(delivery => ({
        ...delivery,
        status: (delivery.status as 'pending' | 'in_transit' | 'delivered' | 'cancelled') || 'pending'
      }));
      
      setDeliveries(typedDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast.error(t('admin.errorFetchingDeliveries'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (deliveryId: string, newStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', deliveryId);
      
      if (error) throw error;
      
      setDeliveries(deliveries.map(delivery => 
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      ));
      toast.success(t('admin.deliveryStatusUpdated'));
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error(t('admin.errorUpdatingDeliveryStatus'));
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesQuery = 
      delivery.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.drop_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesQuery && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t('admin.manageDeliveries')}</h1>
          <p className="text-muted-foreground">{t('admin.manageDeliveriesSubtitle')}</p>
        </div>
      </div>

      <Card className="bg-[#FAF3E0] border-[#C07C56] mb-6">
        <CardHeader className="flex flex-col md:flex-row justify-between">
          <CardTitle className="text-[#6F4E37] mb-4 md:mb-0">{t('admin.deliveriesList')}</CardTitle>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow md:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input 
                placeholder={t('admin.searchDeliveries')}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t('admin.allStatus')}</option>
              <option value="pending">{t('deliveries.pending')}</option>
              <option value="in_transit">{t('deliveries.inTransit')}</option>
              <option value="delivered">{t('deliveries.delivered')}</option>
              <option value="cancelled">{t('deliveries.cancelled')}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#C07C56]/20">
                  <th className="text-left py-3 px-4">{t('deliveries.id')}</th>
                  <th className="text-left py-3 px-4">{t('deliveries.user')}</th>
                  <th className="text-left py-3 px-4">{t('deliveries.pickupAddress')}</th>
                  <th className="text-left py-3 px-4">{t('deliveries.dropAddress')}</th>
                  <th className="text-left py-3 px-4">{t('deliveries.status')}</th>
                  <th className="text-left py-3 px-4">{t('deliveries.createdAt')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-[#C07C56]/20 hover:bg-[#C07C56]/5">
                    <td className="py-3 px-4">{delivery.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4">{delivery.user_id}</td>
                    <td className="py-3 px-4">{delivery.pickup_address?.substring(0, 20)}...</td>
                    <td className="py-3 px-4">{delivery.drop_address?.substring(0, 20)}...</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : ''}
                        ${delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${delivery.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(delivery.created_at || '').toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link to={`/deliveries/${delivery.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Eye size={16} />
                          </Button>
                        </Link>
                        {delivery.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                            onClick={() => handleStatusChange(delivery.id, 'in_transit')}
                          >
                            <TruckIcon size={16} />
                          </Button>
                        )}
                        {delivery.status === 'in_transit' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                            onClick={() => handleStatusChange(delivery.id, 'delivered')}
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                        {delivery.status !== 'cancelled' && delivery.status !== 'delivered' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleStatusChange(delivery.id, 'cancelled')}
                          >
                            <XCircle size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDeliveriesPage;
