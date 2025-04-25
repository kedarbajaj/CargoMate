
import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import NotificationsPopover from './NotificationsPopover';
import UserAccountDropdown from './UserAccountDropdown';
import { Sidebar, SidebarProvider, SidebarContent, SidebarHeader, SidebarGroup, 
         SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { PackageOpen, TruckIcon, BarChart, CreditCard, Map, User, MessageSquare, 
         Menu, X, Home, Settings, Bell, UserCircle, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isAdmin, isVendor } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/dashboard", icon: <Home size={18} />, label: t('navigation.dashboard') },
    { path: "/deliveries", icon: <TruckIcon size={18} />, label: t('navigation.deliveries') },
    { path: "/deliveries/new", icon: <PackageOpen size={18} />, label: t('navigation.newDelivery') },
    { path: "/tracking", icon: <Map size={18} />, label: t('navigation.tracking') },
    { path: "/payments", icon: <CreditCard size={18} />, label: t('navigation.payments') },
    { path: "/profile", icon: <User size={18} />, label: t('navigation.profile') },
    { path: "/feedback", icon: <MessageSquare size={18} />, label: t('feedback.title') },
  ];

  const vendorNavItems = [
    { path: "/vendor-dashboard", icon: <BarChart size={18} />, label: t('vendor.dashboard') },
  ];

  const adminNavItems = [
    { path: "/admin-dashboard", icon: <BarChart size={18} />, label: t('admin.dashboard') },
    { path: "/admin-users", icon: <User size={18} />, label: t('admin.manageUsers') },
    { path: "/admin-vendors", icon: <TruckIcon size={18} />, label: t('admin.manageVendors') },
    { path: "/admin-deliveries", icon: <PackageOpen size={18} />, label: t('admin.manageDeliveries') },
    { path: "/admin-settings", icon: <Settings size={18} />, label: t('admin.settings') },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDF8F2]">
      {/* Desktop Sidebar with SidebarProvider */}
      <SidebarProvider>
        <Sidebar className="hidden lg:block bg-[#FAF3E0] border-r border-[#C07C56]/20 w-64">
          <SidebarHeader className="flex items-center p-4 border-b border-[#C07C56]/20">
            <PackageOpen size={24} className="text-[#C07C56]" />
            <h1 className="text-xl font-bold ml-2 text-[#6F4E37]">CargoMate</h1>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.path} 
                          className={`flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 font-medium ${
                            isActive(item.path) 
                              ? 'bg-[#6F4E37]/10 text-[#C07C56]' 
                              : 'text-[#6F4E37]'
                          }`}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {isVendor && (
              <SidebarGroup className="mt-4 pt-4 border-t border-[#C07C56]/20">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {vendorNavItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.path}
                            className={`flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 font-medium ${
                              isActive(item.path) 
                                ? 'bg-[#6F4E37]/10 text-[#C07C56]' 
                                : 'text-[#6F4E37]'
                            }`}
                          >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {isAdmin && (
              <SidebarGroup className="mt-4 pt-4 border-t border-[#C07C56]/20">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminNavItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.path}
                            className={`flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 font-medium ${
                              isActive(item.path) 
                                ? 'bg-[#6F4E37]/10 text-[#C07C56]' 
                                : 'text-[#6F4E37]'
                            }`}
                          >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>
      
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-[#C07C56]/20 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="lg:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Menu size={24} className="text-[#6F4E37]" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#FAF3E0] border-r border-[#C07C56]/20 w-[300px] sm:w-[400px]">
                      <div className="flex items-center mb-6">
                        <PackageOpen size={24} className="text-[#C07C56]" />
                        <h1 className="text-xl font-bold ml-2 text-[#6F4E37]">CargoMate</h1>
                      </div>
                      <nav className="flex flex-col space-y-2">
                        {navItems.map((item) => (
                          <Link 
                            key={item.path}
                            to={item.path}
                            onClick={closeMenu}
                            className={`flex items-center px-4 py-3 rounded-md font-medium ${
                              isActive(item.path) 
                                ? 'bg-[#6F4E37]/10 text-[#C07C56]' 
                                : 'text-[#6F4E37] hover:bg-[#6F4E37]/5'
                            }`}
                          >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                          </Link>
                        ))}

                        {isVendor && (
                          <>
                            <div className="border-t border-[#C07C56]/20 my-2 pt-2">
                              <h3 className="px-4 py-2 text-sm font-semibold text-[#6F4E37]/70">
                                {t('vendor.vendorSection')}
                              </h3>
                            </div>
                            {vendorNavItems.map((item) => (
                              <Link 
                                key={item.path}
                                to={item.path}
                                onClick={closeMenu}
                                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                                  isActive(item.path) 
                                    ? 'bg-[#6F4E37]/10 text-[#C07C56]' 
                                    : 'text-[#6F4E37] hover:bg-[#6F4E37]/5'
                                }`}
                              >
                                {item.icon}
                                <span className="ml-3">{item.label}</span>
                              </Link>
                            ))}
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <div className="border-t border-[#C07C56]/20 my-2 pt-2">
                              <h3 className="px-4 py-2 text-sm font-semibold text-[#6F4E37]/70">
                                {t('admin.adminSection')}
                              </h3>
                            </div>
                            {adminNavItems.map((item) => (
                              <Link 
                                key={item.path}
                                to={item.path}
                                onClick={closeMenu}
                                className={`flex items-center px-4 py-3 rounded-md font-medium ${
                                  isActive(item.path) 
                                    ? 'bg-[#6F4E37]/10 text-[#C07C56]' 
                                    : 'text-[#6F4E37] hover:bg-[#6F4E37]/5'
                                }`}
                              >
                                {item.icon}
                                <span className="ml-3">{item.label}</span>
                              </Link>
                            ))}
                          </>
                        )}

                        <div className="border-t border-[#C07C56]/20 my-2 pt-4 pb-2">
                          <div className="px-4 py-2 flex items-center">
                            <Globe size={18} className="text-[#6F4E37]" />
                            <span className="ml-3 text-[#6F4E37]">{t('language.select')}</span>
                          </div>
                          <div className="px-4 py-2">
                            <LanguageSelector />
                          </div>
                        </div>
                      </nav>
                    </SheetContent>
                  </Sheet>
                </div>
                <PackageOpen size={24} className="text-[#C07C56] lg:hidden" />
                <h1 className="text-xl font-bold ml-2 text-[#6F4E37] lg:hidden">CargoMate</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <LanguageSelector />
                </div>
                
                <div className="hidden md:block h-6 w-px bg-[#C07C56]/20"></div>
                
                <NotificationsPopover />
                
                {user && <UserAccountDropdown />}
              </div>
            </div>
          </header>
          
          {/* Mobile Navigation Tabs (only shows on smaller screens) */}
          <div className="lg:hidden bg-[#FAF3E0] border-b border-[#C07C56]/20 overflow-x-auto">
            <div className="flex p-1">
              <Link 
                to="/dashboard" 
                className={`flex flex-col items-center flex-1 px-3 py-2 rounded-md ${
                  isActive("/dashboard") ? "bg-[#6F4E37]/10 text-[#C07C56]" : "text-[#6F4E37]"
                }`}
              >
                <BarChart size={20} />
                <span className="text-xs mt-1">{t('navigation.dashboard')}</span>
              </Link>
              
              <Link 
                to="/deliveries" 
                className={`flex flex-col items-center flex-1 px-3 py-2 rounded-md ${
                  isActive("/deliveries") ? "bg-[#6F4E37]/10 text-[#C07C56]" : "text-[#6F4E37]"
                }`}
              >
                <TruckIcon size={20} />
                <span className="text-xs mt-1">{t('navigation.deliveries')}</span>
              </Link>
              
              <Link 
                to="/deliveries/new" 
                className={`flex flex-col items-center flex-1 px-3 py-2 rounded-md ${
                  isActive("/deliveries/new") ? "bg-[#6F4E37]/10 text-[#C07C56]" : "text-[#6F4E37]"
                }`}
              >
                <PackageOpen size={20} />
                <span className="text-xs mt-1">{t('navigation.new')}</span>
              </Link>
              
              <Link 
                to="/tracking" 
                className={`flex flex-col items-center flex-1 px-3 py-2 rounded-md ${
                  isActive("/tracking") ? "bg-[#6F4E37]/10 text-[#C07C56]" : "text-[#6F4E37]"
                }`}
              >
                <Map size={20} />
                <span className="text-xs mt-1">{t('navigation.tracking')}</span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`flex flex-col items-center flex-1 px-3 py-2 rounded-md ${
                  isActive("/profile") ? "bg-[#6F4E37]/10 text-[#C07C56]" : "text-[#6F4E37]"
                }`}
              >
                <UserCircle size={20} />
                <span className="text-xs mt-1">{t('navigation.profile')}</span>
              </Link>
            </div>
          </div>
          
          {/* Page content */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default MainLayout;
