
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TruckIcon, CheckCircle, XCircle, Plus, FileText, BarChart } from 'lucide-react';
import { Delivery } from '@/types/delivery';
import { Badge } from "@/components/ui/badge"; 
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface VendorStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  inTransitDeliveries: number;
  deliveredDeliveries: number;
  cancelledDeliveries: number;
  recentAvgRating?: number;
}

const VendorDashboardPage: React.FC = () => {
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VendorStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    deliveredDeliveries: 0,
    cancelledDeliveries: 0,
    recentAvgRating: 4.5,
  });
  const [availableForDelivery, setAvailableForDelivery] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVendorDeliveries = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const deliveries = data || [];
        setRecentDeliveries(deliveries.slice(0, 5));
        setAllDeliveries(deliveries);
        
        // Calculate stats
        setStats({
          totalDeliveries: deliveries.length,
          pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
          inTransitDeliveries: deliveries.filter(d => d.status === 'in_transit').length,
          deliveredDeliveries: deliveries.filter(d => d.status === 'delivered').length,
          cancelledDeliveries: deliveries.filter(d => d.status === 'cancelled').length,
          recentAvgRating: 4.5, // Sample data - would come from a ratings table in a real app
        });
      } catch (error) {
        console.error('Error fetching vendor deliveries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorDeliveries();
  }, [user]);

  const handleStatusChange = async (deliveryId: string, newStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', deliveryId);
        
      if (error) throw error;
      
      // Update the local state
      setRecentDeliveries(recentDeliveries.map(delivery => 
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      ));
      
      setAllDeliveries(allDeliveries.map(delivery => 
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      ));
      
      // Recalculate stats
      setStats({
        ...stats,
        pendingDeliveries: allDeliveries.filter(d => 
          d.id === deliveryId ? newStatus === 'pending' : d.status === 'pending'
        ).length,
        inTransitDeliveries: allDeliveries.filter(d => 
          d.id === deliveryId ? newStatus === 'in_transit' : d.status === 'in_transit'
        ).length,
        deliveredDeliveries: allDeliveries.filter(d => 
          d.id === deliveryId ? newStatus === 'delivered' : d.status === 'delivered'
        ).length,
        cancelledDeliveries: allDeliveries.filter(d => 
          d.id === deliveryId ? newStatus === 'cancelled' : d.status === 'cancelled'
        ).length,
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto border-4 border-t-[#C07C56] border-[#FAF3E0] rounded-full animate-spin"></div>
          <p className="mt-2 text-[#6F4E37]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#3B2F2F]">{t('vendor.dashboard')}</h1>
          <p className="text-muted-foreground">{t('vendor.subtitle')}</p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <Switch 
              id="availability" 
              checked={availableForDelivery}
              onCheckedChange={setAvailableForDelivery}
            />
            <Label htmlFor="availability" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {availableForDelivery ? t('vendor.available') : t('vendor.unavailable')}
            </Label>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#C07C56] hover:bg-[#6F4E37] text-white flex items-center gap-2">
                <Plus size={16} />
                {t('vendor.createDeliveryRoute')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('vendor.createDeliveryRoute')}</DialogTitle>
                <DialogDescription>{t('vendor.createDeliveryRouteDescription')}</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">{t('vendor.deliveryRouteComingSoon')}</p>
              </div>
              <DialogFooter>
                <Button type="button">{t('common.create')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm text-[#6F4E37]">{t('vendor.totalDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <p className="text-2xl font-bold text-[#C07C56]">{stats.totalDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm text-[#6F4E37]">{t('vendor.pendingDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm text-[#6F4E37]">{t('vendor.inTransitDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <p className="text-2xl font-bold text-blue-500">{stats.inTransitDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm text-[#6F4E37]">{t('vendor.deliveredDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <p className="text-2xl font-bold text-green-500">{stats.deliveredDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm text-[#6F4E37]">{t('vendor.cancelledDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <p className="text-2xl font-bold text-red-500">{stats.cancelledDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm text-[#6F4E37]">{t('vendor.rating')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-3 px-4">
            <p className="text-2xl font-bold text-[#C07C56]">{stats.recentAvgRating}/5</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for deliveries */}
      <Card className="mt-6 border-[#C07C56] bg-[#FAF3E0]">
        <CardHeader>
          <CardTitle className="text-[#6F4E37]">{t('vendor.deliveries')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="recent">{t('vendor.recentDeliveries')}</TabsTrigger>
              <TabsTrigger value="pending">{t('vendor.pendingDeliveries')}</TabsTrigger>
              <TabsTrigger value="in_transit">{t('vendor.inTransitDeliveries')}</TabsTrigger>
              <TabsTrigger value="delivered">{t('vendor.deliveredDeliveries')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
              {renderDeliveryTable(recentDeliveries)}
            </TabsContent>
            
            <TabsContent value="pending">
              {renderDeliveryTable(allDeliveries.filter(d => d.status === 'pending'))}
            </TabsContent>
            
            <TabsContent value="in_transit">
              {renderDeliveryTable(allDeliveries.filter(d => d.status === 'in_transit'))}
            </TabsContent>
            
            <TabsContent value="delivered">
              {renderDeliveryTable(allDeliveries.filter(d => d.status === 'delivered'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Activity Feed */}
      <Card className="mt-6 border-[#C07C56] bg-[#FAF3E0]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#6F4E37]">{t('vendor.recentActivity')}</CardTitle>
          <Button variant="outline" className="text-[#6F4E37] border-[#C07C56]">
            {t('vendor.viewAll')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {allDeliveries.slice(0, 3).map((delivery, index) => (
              <div key={delivery.id} className="flex items-start">
                <div className="mr-4 mt-0.5">
                  {delivery.status === 'delivered' && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {delivery.status === 'in_transit' && <TruckIcon className="h-6 w-6 text-blue-500" />}
                  {delivery.status === 'pending' && <Package className="h-6 w-6 text-yellow-500" />}
                  {delivery.status === 'cancelled' && <XCircle className="h-6 w-6 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t(`deliveries.${delivery.status}Status`)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('vendor.delivery')} #{delivery.id.substring(0, 8)} - {delivery.pickup_address?.substring(0, 20)} to {delivery.drop_address?.substring(0, 20)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(delivery.created_at || '')}</p>
                </div>
                <Link to={`/deliveries/${delivery.id}`}>
                  <Button variant="ghost" size="sm" className="text-[#C07C56]">
                    {t('common.view')}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  function renderDeliveryTable(deliveries: Delivery[]) {
    if (deliveries.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-md">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="font-medium text-lg mt-2 text-[#6F4E37]">{t('vendor.noDeliveries')}</h3>
          <p className="text-muted-foreground mt-1">{t('vendor.deliveriesWillAppear')}</p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#F2E8D5]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6F4E37] uppercase tracking-wider">
                    {t('deliveries.id')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6F4E37] uppercase tracking-wider">
                    {t('deliveries.pickupAddress')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6F4E37] uppercase tracking-wider">
                    {t('deliveries.dropAddress')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6F4E37] uppercase tracking-wider">
                    {t('deliveries.status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6F4E37] uppercase tracking-wider">
                    {t('deliveries.createdAt')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6F4E37] uppercase tracking-wider">
                    {t('deliveries.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {delivery.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.pickup_address?.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.drop_address?.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadgeColor(delivery.status)}>
                        {delivery.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(delivery.created_at || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/deliveries/${delivery.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <FileText size={16} />
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
        </div>
      </div>
    );
  }
  
  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  }
};

export default VendorDashboardPage;
