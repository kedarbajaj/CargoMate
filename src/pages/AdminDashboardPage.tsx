
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { supabase } from '@/integrations/supabase/client';
import { Delivery, Payment } from '@/types/delivery';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deliveries
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('deliveries')
          .select('*')
          .order('created_at', { ascending: false });

        if (deliveryError) throw deliveryError;
        setDeliveries(deliveryData || []);

        // Fetch payments
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (paymentError) throw paymentError;
        setPayments(paymentData || []);

        // Count recent feedback
        try {
          // Just to avoid errors, let's check if the table exists first by querying notifications
          const { count, error: feedbackError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('status', 'unread');
            
          if (feedbackError) throw feedbackError;
          setFeedbackCount(count || 0);
        } catch (error) {
          console.error('Error fetching feedback count:', error);
          setFeedbackCount(0);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate analytics values
  const totalDeliveries = deliveries.length;
  const pendingCount = deliveries.filter(delivery => delivery.status === 'pending').length;
  const inTransitCount = deliveries.filter(delivery => delivery.status === 'in_transit').length;
  const deliveredCount = deliveries.filter(delivery => delivery.status === 'delivered').length;
  const cancelledCount = deliveries.filter(delivery => delivery.status === 'cancelled').length;

  const totalRevenue = payments.reduce((sum, payment) => {
    return payment.status === 'successful' ? sum + (payment.amount || 0) : sum;
  }, 0);

  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
  const successfulPayments = payments.filter(payment => payment.status === 'successful').length;
  const failedPayments = payments.filter(payment => payment.status === 'failed').length;

  // Chart data
  const statusChartData = {
    labels: [t('deliveries.pending'), t('deliveries.inTransit'), t('deliveries.delivered'), t('deliveries.cancelled')],
    datasets: [
      {
        label: t('admin.deliveryStatus'),
        data: [pendingCount, inTransitCount, deliveredCount, cancelledCount],
        backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444'],
      },
    ],
  };

  const paymentChartData = {
    labels: [t('payments.status') + ': ' + t('payments.pending'), t('payments.status') + ': ' + t('common.success'), t('payments.status') + ': ' + t('common.failed')],
    datasets: [
      {
        label: t('payments.title'),
        data: [pendingPayments, successfulPayments, failedPayments],
        backgroundColor: ['#fbbf24', '#10b981', '#ef4444'],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-t-primary border-primary/30 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{t('admin.dashboard')}</h1>
      <p className="text-muted-foreground mb-6">{t('admin.subtitle')}</p>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37] text-lg">{t('admin.totalDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#C07C56]">{totalDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37] text-lg">{t('admin.totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#C07C56]">₹{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37] text-lg">{t('admin.feedback')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#C07C56]">{feedbackCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#6F4E37] text-lg">{t('dashboard.deliveredCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#C07C56]">{deliveredCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('admin.deliveryStatus')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('admin.statusDistribution')}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex justify-center">
              <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#FAF3E0] border-[#C07C56]">
          <CardHeader>
            <CardTitle className="text-[#6F4E37]">{t('payments.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('payments.status')}</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex justify-center">
              <Pie data={paymentChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
