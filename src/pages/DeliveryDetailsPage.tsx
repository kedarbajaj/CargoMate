import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatWeight, getDeliveryStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DeliveryInvoice from '@/components/invoice/DeliveryInvoice';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { useTranslation } from 'react-i18next';

interface Delivery {
  id: string;
  pickup_address: string;
  drop_address: string;
  weight_kg: number;
  scheduled_date: string;
  status: string;
  created_at: string;
  user_id: string;
  vendor_id: string;
  package_type?: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

const DeliveryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (id && user) {
      const fetchDelivery = async () => {
        setLoading(true);
        try {
          // Adding package_type to the query
          const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          // Make sure the data includes package_type, defaulting to 'standard' if not present
          const deliveryWithPackageType: Delivery = {
            ...data,
            package_type: data.package_type || 'standard'
          };
          
          setDelivery(deliveryWithPackageType);
          
          // Fetch user profile for invoice
          if (data.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name, email, phone')
              .eq('id', data.user_id)
              .single();
              
            if (userError) throw userError;
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching delivery:', error);
          toast.error(t('common.error'));
        } finally {
          setLoading(false);
        }
      };

      fetchDelivery();
    }
  }, [id, user, t]);

  const revalidate = async () => {
    if (id && user) {
      try {
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // Make sure the data includes package_type, defaulting to 'standard' if not present
        const deliveryWithPackageType: Delivery = {
          ...data,
          package_type: data.package_type || 'standard'
        };
        
        setDelivery(deliveryWithPackageType);
      } catch (error) {
        console.error('Error revalidating delivery:', error);
        toast.error(t('common.error'));
      }
    }
  };

  const handleAcceptDelivery = async () => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'in_transit' })
        .eq('id', id);

      if (error) throw error;

      toast.success(t('delivery.accept'));
      revalidate();
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error(t('common.error'));
    }
  };

  const handleRejectDelivery = async () => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast.success(t('delivery.reject'));
      revalidate();
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      toast.error(t('common.error'));
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'delivered' })
        .eq('id', id);

      if (error) throw error;

      toast.success(t('delivery.complete'));
      revalidate();
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDownloadInvoice = () => {
    const element = document.getElementById('invoice');
    if (!element) {
      toast.error(t('common.error'));
      return;
    }

    const opt = {
      margin: 10,
      filename: `cargomate-invoice-${id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
    toast.success(t('invoice.download'));
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#FAF3E0]">{t('common.loading')}</div>;
  }

  if (!delivery) {
    return <div className="flex h-screen items-center justify-center bg-[#FAF3E0]">Delivery not found.</div>;
  }

  const invoiceData = delivery && userProfile ? {
    ...delivery,
    user: userProfile,
    amount: 0, // Will be calculated in the component
  } : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {!showInvoice ? (
        <>
          <div>
            <h1 className="text-2xl font-bold text-[#3B2F2F]">{t('delivery.details')}</h1>
            <p className="text-muted-foreground">Details for delivery ID: {delivery.id}</p>
          </div>

          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
            <div className="grid gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#6F4E37]">{t('delivery.details')}</h2>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('delivery.pickupAddress')}</span>
                  <p className="font-semibold">{delivery.pickup_address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('delivery.deliveryAddress')}</span>
                  <p className="font-semibold">{delivery.drop_address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('delivery.weight')}</span>
                  <p className="font-semibold">{formatWeight(delivery.weight_kg)} kg</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('delivery.packageType')}</span>
                  <p className="font-semibold capitalize">{t(`delivery.${delivery.package_type?.replace('_', '') || 'standard'}`)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('delivery.status')}</span>
                  <p>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                      {delivery.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">{t('delivery.createdAt')}</span>
                  <p className="font-semibold">{formatDate(delivery.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Based on Status */}
          <div className="flex flex-wrap justify-end gap-2">
            {delivery.status === 'pending' && (
              <>
                <Button variant="destructive" onClick={handleRejectDelivery} className="bg-red-500 hover:bg-red-600">
                  {t('delivery.reject')}
                </Button>
                <Button variant="default" onClick={handleAcceptDelivery} className="bg-[#C07C56] hover:bg-[#6F4E37] text-white">
                  {t('delivery.accept')}
                </Button>
              </>
            )}
            
            {delivery.status === 'in_transit' && (
              <Button variant="default" onClick={handleCompleteDelivery} className="bg-[#C07C56] hover:bg-[#6F4E37] text-white">
                {t('delivery.complete')}
              </Button>
            )}
            
            {delivery.status === 'delivered' && (
              <Button 
                variant="outline" 
                onClick={() => setShowInvoice(true)}
                className="flex items-center gap-1 border-[#C07C56] text-[#6F4E37]"
              >
                <Download className="h-4 w-4" /> {t('delivery.viewInvoice')}
              </Button>
            )}
          </div>

          {/* Back to Deliveries */}
          <div className="mt-4">
            <Link to="/deliveries">
              <Button variant="secondary" className="bg-[#FAF3E0] text-[#6F4E37] hover:bg-[#C07C56] hover:text-white">
                {t('delivery.backToDetails')}
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowInvoice(false)}
              className="border-[#C07C56] text-[#6F4E37]"
            >
              {t('delivery.backToDetails')}
            </Button>
            <Button 
              variant="default" 
              onClick={handleDownloadInvoice}
              className="flex items-center gap-1 bg-[#C07C56] hover:bg-[#6F4E37] text-white"
            >
              <Download className="h-4 w-4" /> {t('invoice.download')}
            </Button>
          </div>
          
          {invoiceData && (
            <DeliveryInvoice invoiceData={invoiceData} />
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryDetailsPage;
