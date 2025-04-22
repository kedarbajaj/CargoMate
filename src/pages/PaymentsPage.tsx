
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate, getPaymentStatusColor } from '@/lib/utils';

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

  // Calculate total amount paid
  const totalPaid = payments
    .filter(payment => payment.status === 'completed')
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
            <p className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Payments</h3>
          {loading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded-md bg-gray-200"></div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-amber-600">{formatCurrency(totalPending)}</p>
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
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm capitalize">
                        {payment.payment_method?.replace('_', ' ')}
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
