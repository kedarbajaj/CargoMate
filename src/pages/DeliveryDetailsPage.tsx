
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { Delivery, Payment, UserProfile } from '@/types/delivery';
import { useTranslation } from 'react-i18next';
import DeliveryInvoice from '@/components/invoice/DeliveryInvoice';

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, isVendor } = useAuth();
  const { t } = useTranslation();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Check if we should show the invoice based on the URL parameters
  const queryParams = new URLSearchParams(location.search);
  const [viewInvoice, setViewInvoice] = useState(queryParams.get('invoice') === 'true');

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      if (!id) return;

      try {
        // Fetch delivery details
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('deliveries')
          .select('*')
          .eq('id', id)
          .single();

        if (deliveryError) throw deliveryError;

        setDelivery(deliveryData);

        // Fetch payment info
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('delivery_id', id)
          .maybeSingle();

        if (!paymentError && paymentData) {
          setPayment(paymentData);
        }

        // If delivery exists, fetch user profile
        if (deliveryData && deliveryData.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, email, phone')
            .eq('id', deliveryData.user_id)
            .single();

          if (!userError && userData) {
            setUserProfile(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching delivery details:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [id, t]);

  const handleStatusChange = async (newStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled') => {
    try {
      if (!delivery) return;

      const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', delivery.id);

      if (error) throw error;

      setDelivery({ ...delivery, status: newStatus });

      // Notify the user via serverless function
      await supabase.functions.invoke('handle-delivery-action', {
        body: {
          deliveryId: delivery.id,
          action: newStatus,
          userId: delivery.user_id,
        },
      });

      toast.success(`${t('common.success')}! ${t('delivery.status')} ${t(`deliveries.${newStatus}`)}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-[#6F4E37] mb-2">
              {t('common.error')}
            </h2>
            <p>{t('deliveries.noDeliveries')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if the user is authorized to view this delivery
  const isAuthorized = 
    user?.id === delivery.user_id || 
    (isVendor && user?.id === delivery.vendor_id);

  // Prepare invoice data if payment exists
  const invoiceData = payment && userProfile ? {
    id: delivery.id,
    created_at: delivery.created_at || new Date().toISOString(),
    user: {
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
    },
    pickup_address: delivery.pickup_address || '',
    drop_address: delivery.drop_address || '',
    weight_kg: delivery.weight_kg || 0,
    package_type: delivery.package_type || 'Standard',
    amount: payment.amount || 0,
  } : null;

  return (
    <div className="container mx-auto p-4">
      {!viewInvoice ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#3B2F2F]">{t('delivery.details')}</h1>
            {payment && invoiceData && (
              <Button 
                onClick={() => setViewInvoice(true)}
                className="bg-[#C07C56] hover:bg-[#6F4E37]"
              >
                {t('delivery.viewInvoice')}
              </Button>
            )}
          </div>

          <Card className="bg-[#FAF3E0] border-[#C07C56] mb-6">
            <CardHeader>
              <CardTitle className="text-[#6F4E37]">{t('delivery.details')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">{t('delivery.pickupAddress')}</h3>
                  <p className="mb-4">{delivery.pickup_address}</p>
                  
                  <h3 className="font-semibold mb-1">{t('delivery.deliveryAddress')}</h3>
                  <p className="mb-4">{delivery.drop_address}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">{t('delivery.packageType')}</h3>
                  <p className="mb-4">{delivery.package_type}</p>
                  
                  <h3 className="font-semibold mb-1">{t('delivery.weight')}</h3>
                  <p className="mb-4">{delivery.weight_kg} kg</p>
                  
                  <h3 className="font-semibold mb-1">{t('delivery.status')}</h3>
                  <div className="mb-4">
                    <span className={`px-2 py-1 rounded text-white ${
                      delivery.status === 'pending' ? 'bg-yellow-500' :
                      delivery.status === 'in_transit' ? 'bg-blue-500' :
                      delivery.status === 'delivered' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}>
                      {t(`deliveries.${delivery.status}`)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold mb-1">{t('delivery.createdAt')}</h3>
                  <p className="mb-4">
                    {delivery.created_at 
                      ? new Date(delivery.created_at).toLocaleDateString() 
                      : '-'}
                  </p>
                  
                  {delivery.scheduled_date && (
                    <>
                      <h3 className="font-semibold mb-1">{t('delivery.scheduledDate')}</h3>
                      <p className="mb-4">
                        {new Date(delivery.scheduled_date).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Status action buttons for vendors */}
          {isVendor && (
            <Card className="bg-[#FAF3E0] border-[#C07C56] mb-6">
              <CardHeader>
                <CardTitle className="text-[#6F4E37]">{t('vendor.manageDeliveries')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {delivery.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleStatusChange('in_transit')}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {t('delivery.accept')}
                      </Button>
                      <Button 
                        onClick={() => handleStatusChange('cancelled')}
                        variant="destructive"
                      >
                        {t('delivery.reject')}
                      </Button>
                    </>
                  )}
                  
                  {delivery.status === 'in_transit' && (
                    <Button 
                      onClick={() => handleStatusChange('delivered')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {t('delivery.complete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          <Button 
            onClick={() => setViewInvoice(false)} 
            variant="outline" 
            className="mb-4 border-[#C07C56] text-[#6F4E37]"
          >
            ← {t('delivery.backToDetails')}
          </Button>
          
          <h1 className="text-2xl font-bold mb-4 text-[#3B2F2F]">{t('invoice.invoice')}</h1>
          
          {invoiceData && (
            <DeliveryInvoice data={invoiceData} />
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryDetailsPage;
