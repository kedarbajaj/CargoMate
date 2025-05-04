
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  Check, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  status: 'read' | 'unread';
  created_at: string;
  type?: string;
}

const NotificationsPopover: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  useEffect(() => {
    if (!user || !open) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [user, open]);
  
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', id);
        
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'read' } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('user_id', user.id)
        .eq('status', 'unread');
        
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, status: 'read' }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === 'delivery_created') return <Package className="h-5 w-5 text-blue-500" />;
    if (notification.type === 'delivery_in_transit') return <Truck className="h-5 w-5 text-amber-500" />;
    if (notification.type === 'delivery_completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (notification.type === 'delivery_cancelled') return <XCircle className="h-5 w-5 text-red-500" />;
    return <Bell className="h-5 w-5 text-cargomate-500" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 bg-cargomate-50 dark:bg-gray-800">
          <h3 className="font-medium text-cargomate-700 dark:text-cargomate-300">
            {t('notifications.title')}
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-cargomate-600 hover:text-cargomate-800"
            >
              <Check className="mr-1 h-3 w-3" />
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>
        
        <Separator />
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cargomate-500" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    notification.status === 'unread' ? 'bg-cargomate-50/50 dark:bg-gray-800/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {notification.status === 'unread' && (
                      <div className="flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {t('notifications.noNotifications')}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
