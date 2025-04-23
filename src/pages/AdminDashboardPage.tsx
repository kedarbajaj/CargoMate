
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboardPage: React.FC = () => {
  const [deliveryStats, setDeliveryStats] = useState({
    pending: 0,
    in_transit: 0,
    delivered: 0,
    cancelled: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [packageTypeData, setPackageTypeData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch delivery statistics
        const { data: deliveries, error } = await supabase
          .from('deliveries')
          .select('status, package_type');
          
        if (error) throw error;
        
        if (deliveries) {
          // Count deliveries by status
          const stats = {
            pending: 0,
            in_transit: 0,
            delivered: 0,
            cancelled: 0,
            total: deliveries.length
          };
          
          // Count package types for chart
          const packageTypes: Record<string, number> = {};
          
          deliveries.forEach(delivery => {
            // Count by status
            if (delivery.status) {
              stats[delivery.status as keyof typeof stats] = 
                (stats[delivery.status as keyof typeof stats] || 0) + 1;
            }
            
            // Count by package type
            const packageType = delivery.package_type || 'standard';
            packageTypes[packageType] = (packageTypes[packageType] || 0) + 1;
          });
          
          setDeliveryStats(stats);
          
          // Format package type data for chart
          const packageTypeArray = Object.entries(packageTypes).map(([name, value]) => ({
            name,
            value
          }));
          
          setPackageTypeData(packageTypeArray);
        }
      } catch (error) {
        console.error('Error fetching admin statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const deliveryData = [
    { name: 'Pending', value: deliveryStats.pending },
    { name: 'In Transit', value: deliveryStats.in_transit },
    { name: 'Delivered', value: deliveryStats.delivered },
    { name: 'Cancelled', value: deliveryStats.cancelled },
  ];
  
  const COLORS = ['#C07C56', '#6F4E37', '#FAF3E0', '#3B2F2F'];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor all delivery activities and manage system operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : deliveryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : deliveryStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : deliveryStats.in_transit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : deliveryStats.delivered}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>Distribution of deliveries by status</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deliveryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#C07C56" name="Deliveries" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Types</CardTitle>
            <CardDescription>Distribution of package types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              {loading ? (
                <div className="flex h-full items-center justify-center">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {packageTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
