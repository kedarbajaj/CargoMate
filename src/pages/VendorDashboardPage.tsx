
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { formatDate, getDeliveryStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TruckIcon, CheckCircle, XCircle, Plus, FileText, BarChart, ArrowUp, ArrowDown, Clock, Calendar, MapPin } from 'lucide-react';
import { Delivery } from '@/types/delivery';
import { Badge } from "@/components/ui/badge"; 
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VendorStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  inTransitDeliveries: number;
  deliveredDeliveries: number;
  cancelledDeliveries: number;
  recentAvgRating?: number;
  weeklyChangePercent?: number;
  totalEarnings?: number;
}

const VendorDashboardPage: React.FC = () => {
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VendorStats>({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    deliveredDeliveries: 0,
    cancelledDeliveries: 0,
    recentAvgRating: 4.5,
    weeklyChangePercent: 12,
    totalEarnings: 24500,
  });
  const [availableForDelivery, setAvailableForDelivery] = useState(true);
  const [showAddRouteDialog, setShowAddRouteDialog] = useState(false);
  const [newRoute, setNewRoute] = useState({
    startLocation: '',
    endLocation: '',
    availableSlots: 5,
    departureTime: '',
    expectedArrivalTime: '',
    vehicleType: 'Truck',
    pricePerKg: 20
  });
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchVendorDeliveries = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const deliveries = data || [];
        setRecentDeliveries(deliveries.slice(0, 5));
        setAllDeliveries(deliveries);
        
        // Calculate stats
        setStats({
          totalDeliveries: deliveries.length,
          pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
          inTransitDeliveries: deliveries.filter(d => d.status === 'in_transit').length,
          deliveredDeliveries: deliveries.filter(d => d.status === 'delivered').length,
          cancelledDeliveries: deliveries.filter(d => d.status === 'cancelled').length,
          recentAvgRating: 4.5, // Sample data - would come from a ratings table in a real app
          weeklyChangePercent: 12,
          totalEarnings: 24500,
        });
      } catch (error) {
        console.error('Error fetching vendor deliveries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorDeliveries();
  }, [user]);

  const handleStatusChange = async (deliveryId: string, newStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: newStatus })
        .eq('id', deliveryId);
        
      if (error) throw error;
      
      // Update the local state
      setRecentDeliveries(recentDeliveries.map(delivery => 
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      ));
      
      setAllDeliveries(allDeliveries.map(delivery => 
        delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
      ));
      
      // Recalculate stats
      const updatedDeliveries = allDeliveries.map(d => 
        d.id === deliveryId ? { ...d, status: newStatus } : d
      );
      
      setStats({
        ...stats,
        pendingDeliveries: updatedDeliveries.filter(d => d.status === 'pending').length,
        inTransitDeliveries: updatedDeliveries.filter(d => d.status === 'in_transit').length,
        deliveredDeliveries: updatedDeliveries.filter(d => d.status === 'delivered').length,
        cancelledDeliveries: updatedDeliveries.filter(d => d.status === 'cancelled').length,
      });

      toast.success(`Delivery status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const handleRouteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRoute(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateRoute = () => {
    // This would connect to your backend to create a new route
    toast.success('New delivery route created successfully!');
    setShowAddRouteDialog(false);
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setAvailableForDelivery(checked);
    toast.success(checked 
      ? 'You are now available for new deliveries' 
      : 'You are now set as unavailable for new deliveries');
  };

  const renderDeliveryTable = (deliveries: Delivery[]) => {
    if (deliveries.length === 0) {
      return (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No deliveries found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When you receive deliveries, they will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.id')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.pickupAddress')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.dropAddress')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.status')}</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">{t('deliveries.createdAt')}</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <Link to={`/deliveries/${delivery.id}`} className="text-primary hover:underline">
                    {delivery.id.substring(0, 8)}...
                  </Link>
                </td>
                <td className="py-3 px-4">{truncateAddress(delivery.pickup_address)}</td>
                <td className="py-3 px-4">{truncateAddress(delivery.drop_address)}</td>
                <td className="py-3 px-4">
                  <Badge variant={getStatusBadgeVariant(delivery.status)} className="capitalize">
                    {delivery.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-3 px-4">{new Date(delivery.created_at || '').toLocaleDateString()}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/deliveries/${delivery.id}`}>
                      <Button variant="outline" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>
                    {renderStatusActionButtons(delivery)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStatusActionButtons = (delivery: Delivery) => {
    switch (delivery.status) {
      case 'pending':
        return (
          <Button 
            variant="info" 
            size="sm"
            onClick={() => handleStatusChange(delivery.id, 'in_transit')}
          >
            {t('vendor.startDelivery')}
          </Button>
        );
      case 'in_transit':
        return (
          <Button 
            variant="success" 
            size="sm"
            onClick={() => handleStatusChange(delivery.id, 'delivered')}
          >
            {t('vendor.completeDelivery')}
          </Button>
        );
      case 'delivered':
        return null;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_transit': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const truncateAddress = (address?: string): string => {
    if (!address) return 'N/A';
    return address.length > 25 ? `${address.substring(0, 25)}...` : address;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto border-4 border-t-primary border-primary/30 rounded-full animate-spin"></div>
          <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 animate-enter">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('vendor.dashboard')}</h1>
          <p className="text-muted-foreground mt-1">{t('vendor.subtitle')}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <div className="flex items-center space-x-2 mr-2 bg-muted/50 px-3 py-1 rounded-lg">
            <Switch 
              id="availability" 
              checked={availableForDelivery}
              onCheckedChange={handleAvailabilityChange}
            />
            <Label htmlFor="availability" className="text-sm font-medium cursor-pointer select-none">
              {availableForDelivery ? t('vendor.available') : t('vendor.unavailable')}
            </Label>
          </div>
          
          <Dialog open={showAddRouteDialog} onOpenChange={setShowAddRouteDialog}>
            <DialogTrigger asChild>
              <Button variant="vendor" className="flex items-center gap-2">
                <Plus size={16} />
                {t('vendor.createDeliveryRoute')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('vendor.createDeliveryRoute')}</DialogTitle>
                <DialogDescription>{t('vendor.createDeliveryRouteDescription')}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startLocation">Starting Location</Label>
                    <Input 
                      id="startLocation" 
                      name="startLocation" 
                      placeholder="e.g., Mumbai" 
                      value={newRoute.startLocation}
                      onChange={handleRouteInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endLocation">Destination</Label>
                    <Input 
                      id="endLocation" 
                      name="endLocation" 
                      placeholder="e.g., Delhi" 
                      value={newRoute.endLocation}
                      onChange={handleRouteInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Departure Date & Time</Label>
                    <Input 
                      id="departureTime" 
                      name="departureTime" 
                      type="datetime-local" 
                      value={newRoute.departureTime}
                      onChange={handleRouteInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedArrivalTime">Expected Arrival</Label>
                    <Input 
                      id="expectedArrivalTime" 
                      name="expectedArrivalTime" 
                      type="datetime-local" 
                      value={newRoute.expectedArrivalTime}
                      onChange={handleRouteInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Input 
                      id="vehicleType" 
                      name="vehicleType" 
                      placeholder="e.g., Truck" 
                      value={newRoute.vehicleType}
                      onChange={handleRouteInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availableSlots">Available Slots</Label>
                    <Input 
                      id="availableSlots" 
                      name="availableSlots" 
                      type="number" 
                      min="1" 
                      value={newRoute.availableSlots}
                      onChange={handleRouteInputChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerKg">Price per kg (₹)</Label>
                  <Input 
                    id="pricePerKg" 
                    name="pricePerKg" 
                    type="number" 
                    min="1" 
                    value={newRoute.pricePerKg}
                    onChange={handleRouteInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddRouteDialog(false)}>Cancel</Button>
                <Button variant="vendor" onClick={handleCreateRoute}>Create Route</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="vendor-gradient shadow-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground/80 flex items-center space-x-1">
              <Package size={14} className="mr-1" />
              <span>{t('vendor.totalDeliveries')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold">{stats.totalDeliveries}</p>
              <div className="ml-auto flex items-center">
                <Badge variant="success" className="flex items-center space-x-1 ml-2">
                  <ArrowUp size={12} />
                  <span>{stats.weeklyChangePercent}%</span>
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs. last week</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground/80 flex items-center space-x-1">
              <Clock size={14} className="mr-1" />
              <span>{t('vendor.pendingDeliveries')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-amber-600">{stats.pendingDeliveries}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Awaiting pickup</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground/80 flex items-center space-x-1">
              <TruckIcon size={14} className="mr-1" />
              <span>{t('vendor.inTransitDeliveries')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-blue-600">{stats.inTransitDeliveries}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Currently on route</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground/80 flex items-center space-x-1">
              <CheckCircle size={14} className="mr-1" />
              <span>{t('vendor.deliveredDeliveries')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-green-600">{stats.deliveredDeliveries}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Successfully completed</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground/80 flex items-center space-x-1">
              <XCircle size={14} className="mr-1" />
              <span>{t('vendor.cancelledDeliveries')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold text-red-600">{stats.cancelledDeliveries}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Could not be fulfilled</p>
          </CardContent>
        </Card>
        
        <Card className="vendor-gradient shadow-card overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground/80 flex items-center space-x-1">
              <BarChart size={14} className="mr-1" />
              <span>{t('vendor.rating')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <div className="flex items-center">
              <p className="text-3xl font-bold">{stats.recentAvgRating}/5</p>
              <div className="ml-auto flex">
                {[1, 2, 3, 4].map((star) => (
                  <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="url(#half-star)" />
                  <defs>
                    <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="rgba(0,0,0,0.1)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on 36 reviews</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg">{t('vendor.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <div className="space-y-0 divide-y">
              {allDeliveries.slice(0, 4).map((delivery) => (
                <div key={delivery.id} className="flex items-start p-4">
                  <div className="mr-4 mt-0.5 rounded-full h-10 w-10 flex items-center justify-center bg-vendor-light text-vendor-dark">
                    {delivery.status === 'delivered' && <CheckCircle className="h-5 w-5" />}
                    {delivery.status === 'in_transit' && <TruckIcon className="h-5 w-5" />}
                    {delivery.status === 'pending' && <Clock className="h-5 w-5" />}
                    {delivery.status === 'cancelled' && <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        Delivery {delivery.id.substring(0, 6)}
                      </p>
                      <Badge variant={getStatusBadgeVariant(delivery.status)} className="capitalize">
                        {delivery.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center">
                      <div className="flex items-center mr-4">
                        <MapPin size={14} className="mr-1" />
                        <span>
                          {truncateAddress(delivery.pickup_address)} → {truncateAddress(delivery.drop_address)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 sm:mt-0">
                        <Calendar size={14} className="mr-1" />
                        <span>{formatDate(delivery.created_at)}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Link to={`/deliveries/${delivery.id}`}>
                        <Button variant="outline" size="sm" className="h-8">
                          {t('common.view')}
                        </Button>
                      </Link>
                      {renderStatusActionButtons(delivery)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-lg">{t('vendor.stats')}</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-lg">₹{stats.totalEarnings?.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <span className="mr-1">Total Earnings</span>
                  <Badge variant="success" className="flex items-center gap-1 text-xs">
                    <ArrowUp size={12} />
                    8%
                  </Badge>
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium">Today's Deliveries</p>
                <div className="flex items-center justify-between mt-1">
                  <span>Completed</span>
                  <span className="font-medium">3/5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Upcoming Schedule</p>
                <div className="space-y-2">
                  <div className="rounded-md border p-2 bg-muted/50">
                    <div className="flex justify-between">
                      <p className="font-medium">Mumbai → Pune</p>
                      <Badge variant="outline">Today</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Departure: 3:30 PM</p>
                  </div>
                  <div className="rounded-md border p-2 bg-muted/50">
                    <div className="flex justify-between">
                      <p className="font-medium">Pune → Mumbai</p>
                      <Badge variant="outline">Tomorrow</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Departure: 9:00 AM</p>
                  </div>
                </div>
              </div>

              <Button variant="vendor" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                View Full Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for deliveries */}
      <Card className="shadow-card">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-lg">{t('vendor.deliveries')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="recent" className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-4 gap-4 bg-transparent p-0">
                <TabsTrigger 
                  value="recent" 
                  className="data-[state=active]:bg-vendor data-[state=active]:text-white border border-vendor-light data-[state=active]:border-vendor rounded-md"
                >
                  {t('vendor.recentDeliveries')}
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="data-[state=active]:bg-vendor data-[state=active]:text-white border border-vendor-light data-[state=active]:border-vendor rounded-md"
                >
                  {t('vendor.pendingDeliveries')}
                </TabsTrigger>
                <TabsTrigger 
                  value="in_transit" 
                  className="data-[state=active]:bg-vendor data-[state=active]:text-white border border-vendor-light data-[state=active]:border-vendor rounded-md"
                >
                  {t('vendor.inTransitDeliveries')}
                </TabsTrigger>
                <TabsTrigger 
                  value="delivered" 
                  className="data-[state=active]:bg-vendor data-[state=active]:text-white border border-vendor-light data-[state=active]:border-vendor rounded-md"
                >
                  {t('vendor.deliveredDeliveries')}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="recent" className="pt-2 pb-4 px-0">
              {renderDeliveryTable(recentDeliveries)}
            </TabsContent>
            
            <TabsContent value="pending" className="pt-2 pb-4 px-0">
              {renderDeliveryTable(allDeliveries.filter(d => d.status === 'pending'))}
            </TabsContent>
            
            <TabsContent value="in_transit" className="pt-2 pb-4 px-0">
              {renderDeliveryTable(allDeliveries.filter(d => d.status === 'in_transit'))}
            </TabsContent>
            
            <TabsContent value="delivered" className="pt-2 pb-4 px-0">
              {renderDeliveryTable(allDeliveries.filter(d => d.status === 'delivered'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboardPage;
