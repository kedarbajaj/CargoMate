
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { supabase } from '@/integrations/supabase/client';
import { Delivery, Payment } from '@/types/delivery';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Package, 
  TruckIcon, 
  Settings, 
  ArrowUpRight,
  CreditCard,
  MessageSquare,
  CalendarRange,
  BarChart3,
  TrendingUp,
  InfoIcon,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface DashboardMetrics {
  totalRevenue: number;
  totalDeliveries: number;
  pendingDeliveries: number;
  deliveredDeliveries: number;
  totalUsers: number;
  feedbackCount: number;
  monthlySales: number[];
  monthlyUsers: number[];
  revenueChangePercent: number;
  usersChangePercent: number;
  deliveriesChangePercent: number;
}

const AdminDashboardPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('week'); // 'day', 'week', 'month', 'year'
  const { t } = useTranslation();
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalDeliveries: 0,
    pendingDeliveries: 0,
    deliveredDeliveries: 0,
    totalUsers: 0,
    feedbackCount: 0,
    monthlySales: [12500, 18200, 19800, 15700, 25600, 31200, 38200, 42100, 39500, 45200, 49800, 52300],
    monthlyUsers: [45, 58, 72, 85, 102, 128, 156, 168, 182, 195, 210, 228],
    revenueChangePercent: 12.4,
    usersChangePercent: 8.6,
    deliveriesChangePercent: 15.2,
  });

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

        // Count users
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact' });
          
        if (userError) throw userError;
        
        // Count notifications/feedback
        const { count: feedbackCount, error: feedbackError } = await supabase
          .from('notifications')
          .select('*', { count: 'exact' })
          .eq('status', 'unread');
          
        if (feedbackError) {
          console.log('Feedback table might not exist yet');
        }

        // Calculate metrics
        const totalDeliveries = (deliveryData || []).length;
        const pendingDeliveries = (deliveryData || []).filter(d => d.status === 'pending').length;
        const deliveredDeliveries = (deliveryData || []).filter(d => d.status === 'delivered').length;
        
        const totalRevenue = (paymentData || []).reduce((sum, payment) => {
          return payment.status === 'successful' ? sum + (payment.amount || 0) : sum;
        }, 0);

        setMetrics({
          ...metrics,
          totalRevenue,
          totalDeliveries,
          pendingDeliveries,
          deliveredDeliveries,
          totalUsers: userCount || 0,
          feedbackCount: feedbackCount || 0,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate analytics values for charts
  const pendingCount = deliveries.filter(delivery => delivery.status === 'pending').length;
  const inTransitCount = deliveries.filter(delivery => delivery.status === 'in_transit').length;
  const deliveredCount = deliveries.filter(delivery => delivery.status === 'delivered').length;
  const cancelledCount = deliveries.filter(delivery => delivery.status === 'cancelled').length;

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
        borderColor: ['#f59e0b', '#2563eb', '#059669', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  const paymentChartData = {
    labels: [
      t('payments.status') + ': ' + t('payments.pending'), 
      t('payments.status') + ': ' + t('common.success'), 
      t('payments.status') + ': ' + t('common.failed')
    ],
    datasets: [
      {
        label: t('payments.title'),
        data: [pendingPayments, successfulPayments, failedPayments],
        backgroundColor: ['#fbbf24', '#10b981', '#ef4444'],
        borderColor: ['#f59e0b', '#059669', '#dc2626'],
        borderWidth: 1,
      },
    ],
  };

  // Monthly revenue chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChartData = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: metrics.monthlySales,
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: 'rgb(147, 51, 234)',
        tension: 0.4,
      },
    ],
  };

  // Monthly new users chart data
  const usersChartData = {
    labels: months,
    datasets: [
      {
        label: 'New Users',
        data: metrics.monthlyUsers,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
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
    <div className="container mx-auto p-4 animate-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
          <p className="text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 bg-muted/50 rounded-md px-3 py-1.5">
            <Filter size={16} />
            <select 
              className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarRange size={16} />
            {t('common.exportReport')}
          </Button>
          
          <Button variant="admin" className="flex items-center gap-2">
            <Settings size={16} />
            {t('admin.settings')}
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="admin-gradient shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center">
              <CreditCard size={14} className="mr-2" />
              {t('admin.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-foreground">₹{metrics.totalRevenue.toLocaleString()}</p>
              <Badge variant="success" className="flex items-center gap-1 ml-auto">
                <ArrowUpRight size={14} />
                <span>{metrics.revenueChangePercent}%</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs. previous period</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center">
              <Package size={14} className="mr-2" />
              {t('admin.totalDeliveries')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-foreground">{metrics.totalDeliveries}</p>
              <Badge variant="success" className="flex items-center gap-1 ml-auto">
                <ArrowUpRight size={14} />
                <span>{metrics.deliveriesChangePercent}%</span>
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Pending: {metrics.pendingDeliveries}</span>
              <span>Completed: {metrics.deliveredDeliveries}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center">
              <Users size={14} className="mr-2" />
              {t('admin.userCount')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-foreground">{metrics.totalUsers}</p>
              <Badge variant="success" className="flex items-center gap-1 ml-auto">
                <ArrowUpRight size={14} />
                <span>{metrics.usersChangePercent}%</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total registered users</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center">
              <MessageSquare size={14} className="mr-2" />
              {t('admin.feedback')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-foreground">{metrics.feedbackCount}</p>
              <Badge variant="warning" className="ml-auto">
                <span>Unread</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">New messages requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main analytics dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <Tabs defaultValue="chart" className="w-28">
              <TabsList className="h-8 p-1">
                <TabsTrigger value="chart" className="h-6 px-2 text-xs">
                  <BarChart3 size={14} />
                </TabsTrigger>
                <TabsTrigger value="trend" className="h-6 px-2 text-xs">
                  <TrendingUp size={14} />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="chart" className="mt-0">
              <div className="h-[300px]">
                <Line 
                  data={revenueChartData} 
                  options={lineChartOptions}
                />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Q1</p>
                  <p className="text-lg font-semibold">₹50,500</p>
                  <Badge variant="success" className="mt-1">+12%</Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Q2</p>
                  <p className="text-lg font-semibold">₹72,500</p>
                  <Badge variant="success" className="mt-1">+18%</Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Q3</p>
                  <p className="text-lg font-semibold">₹119,800</p>
                  <Badge variant="success" className="mt-1">+24%</Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Q4</p>
                  <p className="text-lg font-semibold">₹147,300</p>
                  <Badge variant="success" className="mt-1">+9%</Badge>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trend" className="mt-0">
              <div className="h-[300px]">
                <Bar 
                  data={usersChartData} 
                  options={barChartOptions}
                />
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">User Growth</p>
                  <Badge variant="success">+8.6%</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total growth in user base has increased by 8.6% compared to the previous period. 
                  The majority of new signups come through mobile applications.
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Delivery Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <Pie data={statusChartData} options={pieChartOptions} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <Pie data={paymentChartData} options={pieChartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <CardTitle className="text-lg">{t('admin.recentDeliveries')}</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin-deliveries">{t('common.viewAll')}</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.id')}</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.status')}</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.pickupAddress')}</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.createdAt')}</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.slice(0, 5).map((delivery) => (
                    <tr key={delivery.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <Link to={`/deliveries/${delivery.id}`} className="text-primary hover:underline">
                          {delivery.id.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            delivery.status === 'delivered' ? 'success' : 
                            delivery.status === 'in_transit' ? 'info' : 
                            delivery.status === 'pending' ? 'warning' : 
                            'destructive'
                          } 
                          className="capitalize"
                        >
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{delivery.pickup_address?.substring(0, 25)}...</td>
                      <td className="py-3 px-4">{new Date(delivery.created_at || '').toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/deliveries/${delivery.id}`}>{t('common.view')}</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <InfoIcon size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Link to="/admin-users" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  {t('admin.manageUsers')}
                </Button>
              </Link>
              
              <Link to="/admin-deliveries" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Package className="mr-2 h-5 w-5" />
                  {t('admin.manageDeliveries')}
                </Button>
              </Link>
              
              <Link to="/admin-vendors" className="block">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <TruckIcon className="mr-2 h-5 w-5" />
                  {t('admin.manageVendors')}
                </Button>
              </Link>
              
              <Link to="/admin-settings" className="block">
                <Button variant="admin" className="w-full justify-start" size="lg">
                  <Settings className="mr-2 h-5 w-5" />
                  {t('admin.settings')}
                </Button>
              </Link>
              
              <Separator />
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium">System Status</h4>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Database</span>
                  <Badge variant="success">Healthy</Badge>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">API Status</span>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Storage</span>
                  <Badge variant="warning">76% Used</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
