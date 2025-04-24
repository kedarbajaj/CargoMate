
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  status: string;
  created_at: string;
  scheduled_date: string;
  package_type?: string;
  weight_kg: number;
}

const VendorDashboardPage: React.FC = () => {
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
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
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        setRecentDeliveries(data || []);
      } catch (error) {
        console.error('Error fetching vendor deliveries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorDeliveries();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B2F2F]">{t('vendor.dashboard')}</h1>
      <p className="text-muted-foreground">{t('vendor.subtitle')}</p>
      
      <Card className="mt-6 border-[#C07C56] bg-[#FAF3E0]">
        <CardHeader>
          <CardTitle className="text-[#6F4E37]">{t('vendor.recentDeliveries')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{t('vendor.manageDeliveries')}</p>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="h-8 w-8 mx-auto border-4 border-t-[#C07C56] border-[#FAF3E0] rounded-full animate-spin"></div>
              <p className="mt-2 text-[#6F4E37]">{t('common.loading')}</p>
            </div>
          ) : recentDeliveries.length > 0 ? (
            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-md p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{t('delivery.pickupAddress')}</h3>
                      <p className="text-sm text-muted-foreground">{delivery.pickup_address}</p>
                      
                      <h3 className="font-medium mt-2">{t('delivery.deliveryAddress')}</h3>
                      <p className="text-sm text-muted-foreground">{delivery.drop_address}</p>
                      
                      <div className="flex gap-2 mt-2">
                        <span className="text-sm font-medium">{t('delivery.packageType')}:</span>
                        <span className="text-sm">{t(`delivery.${delivery.package_type?.replace('_', '') || 'standard'}`)}</span>
                      </div>
                      
                      <div className="mt-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${getDeliveryStatusColor(delivery.status)}`}>
                          {delivery.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(delivery.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    <Link to={`/deliveries/${delivery.id}`}>
                      <Button variant="outline" className="border-[#C07C56] text-[#6F4E37] hover:bg-[#C07C56] hover:text-white">
                        {t('common.view')}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <Link to="/deliveries">
                  <Button className="bg-[#C07C56] hover:bg-[#6F4E37] text-white">
                    {t('vendor.viewAllDeliveries')}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-md">
              <h3 className="font-medium text-lg text-[#6F4E37]">{t('vendor.noAssignedDeliveries')}</h3>
              <p className="text-muted-foreground mt-1">{t('vendor.deliveriesWillAppear')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboardPage;
