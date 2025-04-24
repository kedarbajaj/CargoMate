
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDate, formatCurrency } from '@/lib/utils';
import DeliveryInvoice from '@/components/invoice/DeliveryInvoice';
import { toast } from 'sonner';
import { Delivery, UserProfile } from '@/types/delivery';
import { useTranslation } from 'react-i18next';
import html2pdf from 'html2pdf.js';

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const { user: authUser, isVendor, isAdmin } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDelivery = async () => {
      setIsLoading(true);
      try {
        if (!id) return;

        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setDelivery(data as Delivery);

        // Fetch the user details of who placed the order
        if (data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user_id)
            .single();

          if (userError) throw userError;
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching delivery details:', error);
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDelivery();
  }, [id, t]);

  const handleDeliveryAction = async (action: 'accept' | 'reject' | 'complete') => {
    try {
      if (!delivery) return;

      // Call Supabase Edge Function to handle delivery actions
      const { data, error } = await supabase.functions.invoke('handle-delivery-action', {
        body: {
          deliveryId: delivery.id,
          action,
          vendorId: authUser?.id
        }
      });

      if (error) throw error;

      // Update the local state with the new status
      setDelivery(prev => {
        if (!prev) return null;
        let newStatus = prev.status;

        switch (action) {
          case 'accept':
            newStatus = 'in_transit';
            break;
          case 'reject':
            newStatus = 'cancelled';
            break;
          case 'complete':
            newStatus = 'delivered';
            break;
        }

        return { ...prev, status: newStatus };
      });

      toast.success(data.message || t('common.success'));
    } catch (error) {
      console.error('Error performing action:', error);
      toast.error(t('common.error'));
    }
  };

  const generatePdf = () => {
    if (!delivery || !user) return;

    const element = document.getElementById('invoice');
    
    if (element) {
      const opt = {
        margin: 1,
        filename: `invoice-${delivery.id.substr(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).save();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#C07C56]"></div>
        <p className="ml-3 text-[#6F4E37]">{t('common.loading')}</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <p>{t('common.error')}</p>
          <Link to="/deliveries" className="text-red-700 font-semibold hover:underline mt-2 block">
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  // For the invoice, calculate an approximate amount based on weight
  const calculateAmount = () => {
    const baseRate = 100; // ₹100 base rate
    const weightRate = 50; // ₹50 per kg
    
    return baseRate + (delivery.weight_kg || 0) * weightRate;
  };

  const amount = calculateAmount();

  // Prepare invoice data
  const invoiceData = {
    id: delivery.id,
    created_at: delivery.created_at || new Date().toISOString(),
    user: {
      name: user?.name || 'Customer',
      email: user?.email || 'No Email Provided',
      phone: user?.phone || 'No Phone Provided'
    },
    pickup_address: delivery.pickup_address || '',
    drop_address: delivery.drop_address || '',
    weight_kg: delivery.weight_kg || 0,
    package_type: delivery.package_type || 'standard',
    amount: amount
  };

  return (
    <div className="container mx-auto p-4">
      {showInvoice ? (
        <div className="flex flex-col">
          <div className="flex justify-between mb-4">
            <Button 
              variant="outline"
              className="border-[#C07C56] text-[#6F4E37]"
              onClick={() => setShowInvoice(false)}
            >
              {t('delivery.backToDetails')}
            </Button>
            <Button 
              className="bg-[#C07C56] text-white hover:bg-[#6F4E37]"
              onClick={generatePdf}
            >
              {t('delivery.downloadInvoice')}
            </Button>
          </div>
          <div id="invoice" className="bg-white p-8 rounded-lg shadow">
            <DeliveryInvoice data={invoiceData} />
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#3B2F2F]">{t('delivery.details')}</h1>
          
          <Card className="mb-6 border-[#C07C56] bg-[#FAF3E0]">
            <CardHeader>
              <CardTitle className="text-[#6F4E37]">{t('delivery.status')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                    ${
                      delivery.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : delivery.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : delivery.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {t(`deliveries.${delivery.status}`)}
                  </span>
                  
                  {(delivery.status === 'pending' || delivery.status === 'in_transit') && isVendor && (
                    <div className="flex space-x-2">
                      {delivery.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleDeliveryAction('accept')}
                            className="bg-[#C07C56] hover:bg-[#6F4E37] text-white"
                          >
                            {t('delivery.accept')}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeliveryAction('reject')}
                            className="border-[#C07C56] text-[#6F4E37]"
                          >
                            {t('delivery.reject')}
                          </Button>
                        </>
                      )}
                      
                      {delivery.status === 'in_transit' && (
                        <Button
                          onClick={() => handleDeliveryAction('complete')}
                          className="bg-[#C07C56] hover:bg-[#6F4E37] text-white"
                        >
                          {t('delivery.complete')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="border-[#C07C56] bg-[#FAF3E0]">
              <CardHeader>
                <CardTitle className="text-[#6F4E37]">{t('delivery.pickupAddress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md">
                  <p>{delivery.pickup_address}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#C07C56] bg-[#FAF3E0]">
              <CardHeader>
                <CardTitle className="text-[#6F4E37]">{t('delivery.deliveryAddress')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md">
                  <p>{delivery.drop_address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-[#C07C56] bg-[#FAF3E0]">
              <CardHeader>
                <CardTitle className="text-[#6F4E37]">{t('delivery.weight')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md">
                  <p>{delivery.weight_kg} kg</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#C07C56] bg-[#FAF3E0]">
              <CardHeader>
                <CardTitle className="text-[#6F4E37]">{t('delivery.packageType')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md">
                  <p>{t(`delivery.${(delivery.package_type || 'standard').replace('_', '')}`)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#C07C56] bg-[#FAF3E0]">
              <CardHeader>
                <CardTitle className="text-[#6F4E37]">{t('delivery.scheduledDate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md">
                  <p>{formatDate(delivery.scheduled_date || '')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between items-center">
            <Link to="/deliveries">
              <Button 
                variant="outline"
                className="border-[#C07C56] text-[#6F4E37]"
              >
                {t('common.back')}
              </Button>
            </Link>
            
            {(delivery.status === 'delivered' || isAdmin) && (
              <Button 
                className="bg-[#C07C56] text-white hover:bg-[#6F4E37]"
                onClick={() => setShowInvoice(true)}
              >
                {t('delivery.viewInvoice')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDetailsPage;
