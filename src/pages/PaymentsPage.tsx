
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import PaymentComponent from '@/components/PaymentComponent';

interface Payment {
  id: string;
  delivery_id?: string;
  amount?: number;
  payment_method?: string;
  status?: string;
  created_at?: string;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPayments(data || []);
        
        // Calculate paid and pending amounts
        let paid = 0;
        let pending = 0;
        
        data?.forEach(payment => {
          if (payment.status === 'completed' && payment.amount) {
            paid += payment.amount;
          } else if (payment.status === 'pending' && payment.amount) {
            pending += payment.amount;
          }
        });
        
        setTotalPaid(paid);
        setPendingAmount(pending);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPayments();
  }, [user, t]);

  const handlePaymentSuccess = () => {
    setSelectedPaymentId(null);
    // Refresh payments data
    if (user) {
      const fetchPayments = async () => {
        try {
          const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setPayments(data || []);
          
          // Recalculate totals
          let paid = 0;
          let pending = 0;
          
          data?.forEach(payment => {
            if (payment.status === 'completed' && payment.amount) {
              paid += payment.amount;
            } else if (payment.status === 'pending' && payment.amount) {
              pending += payment.amount;
            }
          });
          
          setTotalPaid(paid);
          setPendingAmount(pending);
        } catch (error) {
          console.error('Error refreshing payments:', error);
        }
      };
      
      fetchPayments();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B2F2F]">{t('payments.title')}</h1>
      <p className="text-muted-foreground">{t('payments.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.totalPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalPaid + pendingAmount}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.totalPaid')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{totalPaid}</p>
          </CardContent>
        </Card>
        
        <Card className="border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.pendingPayments')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹{pendingAmount}</p>
          </CardContent>
        </Card>
      </div>

      {selectedPaymentId ? (
        <div className="mt-8">
          <div className="mb-4 flex justify-between">
            <h2 className="text-xl font-semibold text-[#6F4E37]">{t('payments.completePayment')}</h2>
            <Button
              variant="outline"
              className="border-[#C07C56] text-[#6F4E37]"
              onClick={() => setSelectedPaymentId(null)}
            >
              {t('common.cancel')}
            </Button>
          </div>
          
          {/* Find the payment details */}
          {payments.find(p => p.id === selectedPaymentId)?.amount && (
            <PaymentComponent 
              deliveryId={payments.find(p => p.id === selectedPaymentId)?.delivery_id}
              amount={payments.find(p => p.id === selectedPaymentId)?.amount || 0}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      ) : (
        <Card className="mt-8 border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.paymentHistory')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-6">
                <div className="h-8 w-8 border-4 border-t-[#C07C56] border-[#FAF3E0] rounded-full animate-spin"></div>
                <span className="ml-3">{t('common.loading')}</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 bg-white">
                <p>{t('payments.noPayments')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#C07C56]/20">
                      <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.date')}</th>
                      <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.amount')}</th>
                      <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.method')}</th>
                      <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.status')}</th>
                      <th className="py-2 px-4 text-left text-[#3B2F2F]">{t('payments.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-[#C07C56]/20 bg-white">
                        <td className="py-3 px-4">{formatDate(payment.created_at || '')}</td>
                        <td className="py-3 px-4">₹{payment.amount}</td>
                        <td className="py-3 px-4">{payment.payment_method || '-'}</td>
                        <td className="py-3 px-4">
                          <span 
                            className={`inline-block px-2 py-1 rounded-full text-xs 
                              ${payment.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : payment.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {payment.status === 'pending' && (
                            <Button
                              size="sm"
                              className="bg-[#C07C56] hover:bg-[#6F4E37] text-white"
                              onClick={() => setSelectedPaymentId(payment.id)}
                            >
                              {t('payments.payNow')}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentsPage;
