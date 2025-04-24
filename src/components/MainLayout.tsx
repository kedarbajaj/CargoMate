
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarSection, SidebarItem } from '@/components/ui/sidebar';
import NotificationsPopover from '@/components/NotificationsPopover';
import UserAccountDropdown from '@/components/UserAccountDropdown';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

// Icons
import {
  PackageIcon,
  TruckIcon,
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  SettingsIcon,
  ShieldIcon,
  BarChartIcon,
  MessageCircleIcon
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAdmin, isVendor } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#FAF3E0]">
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button
          variant="outline"
          size="icon"
          className="border-[#C07C56] text-[#6F4E37] hover:bg-[#C07C56] hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-20 w-64 bg-[#FAF3E0] border-r border-[#C07C56] transition duration-200 ease-in-out lg:static lg:inset-auto lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <Link to="/dashboard" className="flex items-center">
              <TruckIcon className="h-8 w-8 text-[#C07C56]" strokeWidth={1.5} />
              <span className="text-xl font-bold ml-2 text-[#6F4E37]">CargoMate</span>
            </Link>
          </div>

          <Sidebar className="pb-12 w-full flex flex-col h-full border-none">
            <SidebarSection>
              <SidebarItem
                icon={<HomeIcon className="h-4 w-4" />}
                text={t('navigation.dashboard')}
                to={isAdmin ? "/admin-dashboard" : isVendor ? "/vendor-dashboard" : "/dashboard"}
                active={location.pathname === "/dashboard" || location.pathname === "/admin-dashboard" || location.pathname === "/vendor-dashboard"}
              />
              <SidebarItem
                icon={<PackageIcon className="h-4 w-4" />}
                text={t('navigation.deliveries')}
                to="/deliveries"
                active={location.pathname === "/deliveries" || location.pathname.includes("/deliveries/")}
              />
              {!isVendor && (
                <SidebarItem
                  icon={<TruckIcon className="h-4 w-4" />}
                  text={t('navigation.tracking')}
                  to="/tracking"
                  active={location.pathname === "/tracking"}
                />
              )}
              <SidebarItem
                icon={<CreditCardIcon className="h-4 w-4" />}
                text={t('navigation.payments')}
                to="/payments"
                active={location.pathname === "/payments"}
              />
              {isAdmin && (
                <SidebarItem
                  icon={<BarChartIcon className="h-4 w-4" />}
                  text={t('admin.analytics')}
                  to="/admin-dashboard"
                  active={location.pathname === "/admin-dashboard"}
                />
              )}
              {isAdmin && (
                <SidebarItem
                  icon={<UsersIcon className="h-4 w-4" />}
                  text={t('admin.users')}
                  to="/admin-users"
                  active={location.pathname === "/admin-users"}
                />
              )}
              {isVendor && (
                <SidebarItem
                  icon={<ShieldIcon className="h-4 w-4" />}
                  text={t('vendor.deliveries')}
                  to="/vendor-deliveries"
                  active={location.pathname === "/vendor-deliveries"}
                />
              )}
              <SidebarItem
                icon={<MessageCircleIcon className="h-4 w-4" />}
                text={t('feedback.title')}
                to="/feedback"
                active={location.pathname === "/feedback"}
              />
              <SidebarItem
                icon={<SettingsIcon className="h-4 w-4" />}
                text={t('navigation.profile')}
                to="/profile"
                active={location.pathname === "/profile"}
              />
            </SidebarSection>

            <div className="mt-auto p-4">
              <LanguageSelector />
            </div>
          </Sidebar>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-[#C07C56] py-2 px-4 lg:px-8 flex justify-end items-center">
          <div className="flex items-center space-x-4">
            <NotificationsPopover />
            <UserAccountDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
