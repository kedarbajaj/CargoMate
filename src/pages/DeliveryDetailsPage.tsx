
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, Truck, Package, AlertCircle, Clock } from 'lucide-react';

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, isVendor, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  
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
      
      setProcessingAction(true);

      // Call the handle-delivery-action edge function
      const { error } = await supabase.functions.invoke('handle-delivery-action', {
        body: {
          deliveryId: delivery.id,
          action: newStatus === 'in_transit' ? 'accept' : 'reject',
          vendorId: user?.id
        },
      });

      if (error) throw error;

      setDelivery({ ...delivery, status: newStatus });
      
      const actionMessage = newStatus === 'in_transit' 
        ? 'Delivery accepted successfully' 
        : 'Delivery rejected';
      
      toast.success(actionMessage);
      
    } catch (error: any) {
      console.error('Error updating delivery status:', error);
      toast.error(error.message || 'An error occurred while updating the delivery');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_transit': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'in_transit': return <Truck className="h-5 w-5" />;
      case 'delivered': return <Package className="h-5 w-5" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">
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
    (isVendor && user?.id === delivery.vendor_id) ||
    isAdmin;

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

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You are not authorized to view this delivery.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {!viewInvoice ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Delivery Details</h1>
            {payment && invoiceData && (
              <Button 
                onClick={() => setViewInvoice(true)}
                variant="outline"
              >
                View Invoice
              </Button>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Delivery Status</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(delivery.status)}
                  <span className={`px-3 py-1 rounded text-white ${getStatusColor(delivery.status)}`}>
                    {t(`deliveries.${delivery.status}`)}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Pickup Address</h3>
                  <p className="mb-4">{delivery.pickup_address}</p>
                  
                  <h3 className="font-semibold mb-1">Delivery Address</h3>
                  <p className="mb-4">{delivery.drop_address}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Package Type</h3>
                  <p className="mb-4">{delivery.package_type}</p>
                  
                  <h3 className="font-semibold mb-1">Weight</h3>
                  <p className="mb-4">{delivery.weight_kg} kg</p>
                  
                  <h3 className="font-semibold mb-1">Created At</h3>
                  <p className="mb-4">
                    {delivery.created_at 
                      ? new Date(delivery.created_at).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Vendor Actions */}
          {isVendor && user?.id === delivery.vendor_id && delivery.status === 'pending' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Delivery Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="info" className="mb-4">
                  <AlertTitle>Vendor Action Required</AlertTitle>
                  <AlertDescription>
                    Please review this delivery request and decide whether to accept or reject it.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleStatusChange('in_transit')}
                    className="bg-green-500 hover:bg-green-600 gap-2"
                    disabled={processingAction}
                  >
                    <Check size={16} /> Accept Delivery
                  </Button>
                  <Button 
                    onClick={() => handleStatusChange('cancelled')}
                    variant="destructive"
                    className="gap-2"
                    disabled={processingAction}
                  >
                    <X size={16} /> Reject Delivery
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* In Transit Actions */}
          {isVendor && user?.id === delivery.vendor_id && delivery.status === 'in_transit' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Complete Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleStatusChange('delivered')}
                    className="bg-green-500 hover:bg-green-600 gap-2"
                    disabled={processingAction}
                  >
                    <Check size={16} /> Mark as Delivered
                  </Button>
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
            className="mb-4"
          >
            ← Back to Details
          </Button>
          
          <h1 className="text-2xl font-bold mb-4">Invoice</h1>
          
          {invoiceData && (
            <DeliveryInvoice data={invoiceData} />
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryDetailsPage;
