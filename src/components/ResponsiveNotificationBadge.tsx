
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const ResponsiveNotificationBadge: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const NotificationsList = () => (
    <>
      <div className="flex items-center justify-between p-3 font-semibold">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>
      <Separator />
      <div className="max-h-80 overflow-auto">
        {loading ? (
          <div className="flex h-20 items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : notifications.length > 0 ? (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-3 ${
                  notification.status === 'unread' 
                    ? 'bg-cargomate-50' 
                    : ''
                }`}
                onClick={() => {
                  if (notification.status === 'unread') {
                    markAsRead(notification.id);
                  }
                }}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(notification.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-20 items-center justify-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        )}
      </div>
    </>
  );

  // Use different components for mobile vs. desktop
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cargomate-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md p-0">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationsList />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cargomate-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationsList />
      </PopoverContent>
    </Popover>
  );
};

export default ResponsiveNotificationBadge;
