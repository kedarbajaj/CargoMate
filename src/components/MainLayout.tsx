
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Toaster } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, signOut, isAdmin, isVendor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If not logged in, redirect to login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold text-sidebar-foreground">CargoMate</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                        <HomeIcon />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/deliveries" className={location.pathname === '/deliveries' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                        <DeliveryIcon />
                        <span>Deliveries</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {isVendor && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/vendor-dashboard" className={location.pathname === '/vendor-dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                          <VendorIcon />
                          <span>Vendor Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/admin-dashboard" className={location.pathname === '/admin-dashboard' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                          <AdminIcon />
                          <span>Admin Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/tracking" className={location.pathname === '/tracking' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                        <TrackingIcon />
                        <span>Track Delivery</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/payments" className={location.pathname === '/payments' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                        <PaymentsIcon />
                        <span>Payments</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/profile" className={location.pathname === '/profile' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                        <ProfileIcon />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <Button 
              variant="outline" 
              onClick={() => signOut()} 
              className="w-full justify-start"
            >
              <LogoutIcon className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 ml-16 md:ml-64 transition-all duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-xl font-semibold">{getPageTitle(location.pathname)}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationsPopover />
              <UserAccountDropdown />
            </div>
          </div>
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </SidebarProvider>
  );
};

// Helper function to get page title based on current path
const getPageTitle = (pathname: string): string => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return 'Dashboard';
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
};

// Icon Components
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const DeliveryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="M9 8h5" />
  </svg>
);

const TrackingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m3 11 18-5v12L3 14v-3Z" />
    <path d="M11 12a3 3 0 0 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

const PaymentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 1 0-16 0" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const VendorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <path d="M8.5 8.5v.01" />
    <path d="M16 15.5v.01" />
    <path d="M12 12v.01" />
    <path d="M11 17v.01" />
    <path d="M7 14v.01" />
  </svg>
);

// Placeholder components for notifications and user dropdown
// These would be replaced with actual components in a real app
const NotificationsPopover = () => {
  return (
    <Button variant="ghost" size="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    </Button>
  );
};

const UserAccountDropdown = () => {
  return (
    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M12 13a5 5 0 0 0-5 5" />
        <path d="M12 13a5 5 0 0 1 5 5" />
      </svg>
    </Button>
  );
};

export default MainLayout;
