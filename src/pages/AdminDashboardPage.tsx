
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Delivery } from '@/types/delivery';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboardPage: React.FC = () => {
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [deliveryStatusData, setDeliveryStatusData] = useState<{ [key: string]: number }>({});
  const [packageTypeData, setPackageTypeData] = useState<{ [key: string]: number }>({});
  const [revenueData, setRevenueData] = useState<{name: string, amount: number}[]>([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total deliveries
        const { count: deliveriesCount, error: deliveriesError } = await supabase
          .from('deliveries')
          .select('*', { count: 'exact', head: true });

        if (deliveriesError) throw deliveriesError;
        setTotalDeliveries(deliveriesCount || 0);

        // Fetch delivery status distribution
        const { data: statusData, error: statusError } = await supabase
          .from('deliveries')
          .select('status');

        if (statusError) throw statusError;

        const statusCounts: { [key: string]: number } = {};
        statusData?.forEach((delivery: Delivery) => {
          statusCounts[delivery.status] = (statusCounts[delivery.status] || 0) + 1;
        });
        setDeliveryStatusData(statusCounts);

        // Fetch package type distribution
        const { data: packageData, error: packageError } = await supabase
          .from('deliveries')
          .select('package_type');

        if (packageError) throw packageError;

        const packageCounts: { [key: string]: number } = {};
        packageData?.forEach((delivery: any) => {
          const packageType = delivery.package_type || 'standard'; // Provide a default value
          packageCounts[packageType] = (packageCounts[packageType] || 0) + 1;
        });
        setPackageTypeData(packageCounts);

        // Fetch payment data for revenue analytics
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .select('amount, created_at, status')
          .eq('status', 'completed');

        if (paymentError) throw paymentError;

        // Process payment data for weekly revenue
        const weekly: {[key: string]: number} = {};
        const now = new Date();
        
        // Set up last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          weekly[dayStr] = 0;
        }

        // Fill with actual data
        paymentData?.forEach((payment: any) => {
          if (payment.amount && payment.created_at) {
            const paymentDate = new Date(payment.created_at);
            // Only include payments from the last 7 days
            const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24));
            if (daysDiff < 7) {
              const dayStr = paymentDate.toLocaleDateString('en-US', { weekday: 'short' });
              weekly[dayStr] = (weekly[dayStr] || 0) + payment.amount;
            }
          }
        });

        // Convert to array format for recharts
        const revenueArray = Object.keys(weekly).map(key => ({
          name: key,
          amount: Math.round(weekly[key])
        }));
        
        setRevenueData(revenueArray);

        // Fetch feedback count
        const { count: feedbackTotal, error: feedbackError } = await supabase
          .from('feedback')
          .select('*', { count: 'exact', head: true });

        if (!feedbackError) {
          setFeedbackCount(feedbackTotal || 0);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for charts
  const deliveryStatusChartData = {
    labels: Object.keys(deliveryStatusData).map(status => t(`deliveries.${status}`)),
    datasets: [
      {
        label: t('admin.deliveryStatus'),
        data: Object.values(deliveryStatusData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const packageTypeChartData = {
    labels: Object.keys(packageTypeData).map(type => t(`delivery.${type?.replace('_', '')}`)),
    datasets: [
      {
        label: t('admin.packageTypes'),
        data: Object.values(packageTypeData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B2F2F]">{t('admin.dashboard')}</h1>
      <p className="text-muted-foreground">{t('admin.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="bg-card rounded-lg shadow p-4 border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#6F4E37]">{t('admin.totalDeliveries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">{totalDeliveries}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-lg shadow p-4 border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#6F4E37]">{t('admin.totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">
              ₹{revenueData.reduce((sum, day) => sum + day.amount, 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card rounded-lg shadow p-4 border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#6F4E37]">{t('admin.feedback')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-800">{feedbackCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card className="bg-card rounded-lg shadow p-4 border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#6F4E37]">{t('admin.deliveryStatus')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Doughnut data={deliveryStatusChartData} />
          </CardContent>
        </Card>

        <Card className="bg-card rounded-lg shadow p-4 border-[#C07C56] bg-[#FAF3E0]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#6F4E37]">{t('admin.packageTypes')}</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <Doughnut data={packageTypeChartData} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card rounded-lg shadow p-4 mt-4 border-[#C07C56] bg-[#FAF3E0]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#6F4E37]">{t('admin.weeklyRevenue')}</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Bar dataKey="amount" fill="#C07C56" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
