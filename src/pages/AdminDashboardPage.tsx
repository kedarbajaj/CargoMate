
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Delivery {
  id: string;
  status: string;
  package_type?: string;
}

const AdminDashboardPage: React.FC = () => {
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [deliveryStatusData, setDeliveryStatusData] = useState<{ [key: string]: number }>({});
  const [packageTypeData, setPackageTypeData] = useState<{ [key: string]: number }>({});
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
        statusData?.forEach(delivery => {
          statusCounts[delivery.status] = (statusCounts[delivery.status] || 0) + 1;
        });
        setDeliveryStatusData(statusCounts);

        // Fetch package type distribution
        const { data: packageData, error: packageError } = await supabase
          .from('deliveries')
          .select('package_type');

        if (packageError) throw packageError;

        const packageCounts: { [key: string]: number } = {};
        packageData?.forEach((delivery: Delivery) => {
          const packageType = delivery.package_type || 'standard'; // Provide a default value
          packageCounts[packageType] = (packageCounts[packageType] || 0) + 1;
        });
        setPackageTypeData(packageCounts);
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
        <div className="bg-card rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-[#6F4E37]">{t('admin.totalDeliveries')}</h2>
          <p className="text-3xl font-bold text-gray-800">{totalDeliveries}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-card rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-[#6F4E37]">{t('admin.deliveryStatus')}</h2>
          <Doughnut data={deliveryStatusChartData} />
        </div>

        <div className="bg-card rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-[#6F4E37]">{t('admin.packageTypes')}</h2>
          <Doughnut data={packageTypeChartData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
