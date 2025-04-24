import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate, getPaymentStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Wallet, IndianRupee } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  delivery_id: string;
  delivery?: {
    pickup_address: string;
    drop_address: string;
  };
}

const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('credit_card');

  useEffect(() => {
    if (user) {
      const fetchPayments = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('payments')
            .select(`
              *,
              delivery:delivery_id (
                pickup_address,
                drop_address
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setPayments(data || []);
        } catch (error) {
          console.error('Error fetching payments:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPayments();
    }
  }, [user]);

  // Process payment
  const processPayment = async (deliveryId: string) => {
    if (!user) return;
    
    try {
      // In a real app, this would integrate with a payment gateway
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          status: 'successful',
          payment_method: selectedMethod
        })
        .eq('delivery_id', deliveryId)
        .eq('user_id', user.id)
        .select();
        
      if (error) throw error;
      
      // Update the local state
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.delivery_id === deliveryId 
            ? { ...payment, status: 'successful', payment_method: selectedMethod } 
            : payment
        )
      );
      
      toast.success('Payment processed successfully!');
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  // Calculate total amount paid
  const totalPaid = payments
    .filter(payment => payment.status === 'successful')
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate total pending payments
  const totalPending = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View and manage your payment history</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Payments</h3>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded-md bg-gray-200"></div>
          ) : (
            <p className="mt-2 text-2xl font-bold">{payments.length}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Total Paid</h3>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded-md bg-gray-200"></div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totalPaid, 'INR')}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Payments</h3>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded-md bg-gray-200"></div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-amber-600">{formatCurrency(totalPending, 'INR')}</p>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Payment History</h2>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100"></div>
              ))}
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50 text-left text-sm font-medium">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3">Payment ID</th>
                    <th className="whitespace-nowrap px-4 py-3">Date</th>
                    <th className="whitespace-nowrap px-4 py-3">Amount</th>
                    <th className="whitespace-nowrap px-4 py-3">Method</th>
                    <th className="whitespace-nowrap px-4 py-3">Status</th>
                    <th className="whitespace-nowrap px-4 py-3">Delivery</th>
                    <th className="whitespace-nowrap px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                        {payment.id.slice(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold">
                        {formatCurrency(payment.amount, 'INR')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm capitalize">
                        {payment.payment_method?.replace('_', ' ') || 'Not set'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {formatStatus(payment.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {payment.delivery ? (
                          <div className="max-w-[200px] truncate">
                            {truncateAddress(payment.delivery.pickup_address)} → {truncateAddress(payment.delivery.drop_address)}
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {payment.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => setShowPaymentModal(true)} 
                            className="bg-primary hover:bg-primary/90"
                          >
                            Pay Now
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No payment history available</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
            <Separator className="mb-4" />
            
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="space-y-3">
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="credit_card" id="credit_card" />
                <Label htmlFor="credit_card" className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" /> Credit Card
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" /> UPI
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" /> Digital Wallet
                </Label>
              </div>
            </RadioGroup>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
              <Button 
                onClick={() => processPayment(payments.find(p => p.status === 'pending')?.delivery_id || '')}
                className="bg-primary hover:bg-primary/90"
              >
                Complete Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to format status
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Helper function to truncate address
const truncateAddress = (address?: string) => {
  if (!address) return 'N/A';
  return address.length > 15 ? `${address.substring(0, 15)}...` : address;
};

export default PaymentsPage;
