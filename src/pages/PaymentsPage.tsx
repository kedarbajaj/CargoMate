
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PaymentComponent from '@/components/PaymentComponent';
import { Payment } from '@/types/delivery';
import { formatCurrency } from '@/lib/formatUtils';

const PaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPayments(data || []);
      } catch (err) {
        console.error('Error fetching payments:', err);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [user, t]);

  const handlePayNow = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentComplete = async (success: boolean) => {
    if (selectedPayment && success) {
      // Update the payment in the local state
      setPayments(payments.map(payment => 
        payment.id === selectedPayment.id ? {...payment, status: 'successful' as const} : payment
      ));
      
      toast.success(t('payments.paymentSuccess'));
    } else if (selectedPayment) {
      // Mark as failed in the local state
      setPayments(payments.map(payment => 
        payment.id === selectedPayment.id ? {...payment, status: 'failed' as const} : payment
      ));
      
      toast.error(t('payments.paymentFailed'));
    }
    
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  // Calculate total amounts
  const totalPaid = payments.reduce((sum, payment) => {
    return payment.status === 'successful' ? sum + (payment.amount || 0) : sum;
  }, 0);
  
  const pendingAmount = payments.reduce((sum, payment) => {
    return payment.status === 'pending' ? sum + (payment.amount || 0) : sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2 text-[#3B2F2F]">{t('payments.title')}</h1>
      <p className="text-muted-foreground mb-6">{t('payments.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37]">{t('payments.totalPaid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#C07C56]">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37]">{t('payments.pendingPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#C07C56]">{formatCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37]">{t('payments.totalPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#C07C56]">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#FAF3E0] border-[#C07C56]">
        <CardHeader>
          <CardTitle className="text-[#6F4E37]">{t('payments.paymentHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {payments.length > 0 ? (
              <table className="w-full table-auto">
                <thead className="bg-[#6F4E37]/10 text-[#6F4E37]">
                  <tr>
                    <th className="px-4 py-2 text-left">{t('payments.paymentId')}</th>
                    <th className="px-4 py-2 text-left">{t('payments.date')}</th>
                    <th className="px-4 py-2 text-left">{t('payments.amount')}</th>
                    <th className="px-4 py-2 text-left">{t('payments.method')}</th>
                    <th className="px-4 py-2 text-left">{t('payments.status')}</th>
                    <th className="px-4 py-2 text-left">{t('payments.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-[#C07C56]/30">
                      <td className="px-4 py-2">{payment.id.slice(0,8)}</td>
                      <td className="px-4 py-2">{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{formatCurrency(payment.amount || 0)}</td>
                      <td className="px-4 py-2">{payment.payment_method}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-white text-xs ${
                          payment.status === 'successful' ? 'bg-green-500' : 
                          payment.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {payment.status === 'successful' ? t('common.success') :
                           payment.status === 'failed' ? t('common.failed') : t('payments.pending')}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {payment.status === 'pending' && (
                          <Button 
                            className="bg-[#C07C56] hover:bg-[#6F4E37] text-xs h-8"
                            onClick={() => handlePayNow(payment.id)}
                          >
                            {t('payments.payNow')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10">
                <p>{t('payments.noPayments')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isPaymentModalOpen && selectedPayment && (
        <PaymentComponent
          amount={selectedPayment.amount || 0}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentComplete={(success) => handlePaymentComplete(success)}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
