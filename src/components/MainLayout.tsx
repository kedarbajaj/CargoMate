
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import NotificationsPopover from './NotificationsPopover';
import UserAccountDropdown from './UserAccountDropdown';
import { Sidebar } from '@/components/ui/sidebar';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { PackageOpen, TruckIcon, BarChart, CreditCard, Map, User, MessageSquare } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isAdmin, isVendor } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-[#FDF8F2]">
      {/* Sidebar */}
      <Sidebar className="hidden md:block w-64 bg-[#FAF3E0] border-r border-[#C07C56]/20 p-4">
        <div className="flex items-center mb-8">
          <PackageOpen size={24} className="text-[#C07C56]" />
          <h1 className="text-xl font-bold ml-2 text-[#6F4E37]">CargoMate</h1>
        </div>
        
        <nav className="space-y-1">
          <Link 
            to="/dashboard" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <BarChart size={18} className="mr-2" />
            {t('navigation.dashboard')}
          </Link>
          
          <Link 
            to="/deliveries" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <TruckIcon size={18} className="mr-2" />
            {t('navigation.deliveries')}
          </Link>
          
          <Link 
            to="/deliveries/new" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <PackageOpen size={18} className="mr-2" />
            {t('navigation.newDelivery')}
          </Link>
          
          <Link 
            to="/tracking" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <Map size={18} className="mr-2" />
            {t('navigation.tracking')}
          </Link>
          
          <Link 
            to="/payments" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <CreditCard size={18} className="mr-2" />
            {t('navigation.payments')}
          </Link>
          
          <Link 
            to="/profile" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <User size={18} className="mr-2" />
            {t('navigation.profile')}
          </Link>
          
          <Link 
            to="/feedback" 
            className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium"
          >
            <MessageSquare size={18} className="mr-2" />
            {t('feedback.title')}
          </Link>

          {isVendor && (
            <Link 
              to="/vendor-dashboard" 
              className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium mt-4 border-t border-[#C07C56]/20 pt-4"
            >
              <BarChart size={18} className="mr-2" />
              {t('vendor.dashboard')}
            </Link>
          )}

          {isAdmin && (
            <Link 
              to="/admin-dashboard" 
              className="flex items-center px-4 py-2 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37] font-medium mt-4 border-t border-[#C07C56]/20 pt-4"
            >
              <BarChart size={18} className="mr-2" />
              {t('admin.dashboard')}
            </Link>
          )}
        </nav>
      </Sidebar>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#C07C56]/20 shadow-sm">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center md:hidden">
              <PackageOpen size={24} className="text-[#C07C56]" />
              <h1 className="text-xl font-bold ml-2 text-[#6F4E37]">CargoMate</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              
              <div className="h-6 w-px bg-[#C07C56]/20"></div>
              
              <NotificationsPopover />
              
              {user && <UserAccountDropdown />}
            </div>
          </div>
        </header>
        
        {/* Mobile Navigation */}
        <div className="md:hidden bg-[#FAF3E0] border-b border-[#C07C56]/20 p-2 overflow-x-auto">
          <div className="flex space-x-2">
            <Link 
              to="/dashboard" 
              className="flex flex-col items-center px-3 py-1 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37]"
            >
              <BarChart size={16} />
              <span className="text-xs mt-1">{t('navigation.dashboard')}</span>
            </Link>
            
            <Link 
              to="/deliveries" 
              className="flex flex-col items-center px-3 py-1 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37]"
            >
              <TruckIcon size={16} />
              <span className="text-xs mt-1">{t('navigation.deliveries')}</span>
            </Link>
            
            <Link 
              to="/deliveries/new" 
              className="flex flex-col items-center px-3 py-1 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37]"
            >
              <PackageOpen size={16} />
              <span className="text-xs mt-1">{t('navigation.newDelivery')}</span>
            </Link>
            
            <Link 
              to="/tracking" 
              className="flex flex-col items-center px-3 py-1 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37]"
            >
              <Map size={16} />
              <span className="text-xs mt-1">{t('navigation.tracking')}</span>
            </Link>
            
            <Link 
              to="/payments" 
              className="flex flex-col items-center px-3 py-1 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37]"
            >
              <CreditCard size={16} />
              <span className="text-xs mt-1">{t('navigation.payments')}</span>
            </Link>

            <Link 
              to="/feedback" 
              className="flex flex-col items-center px-3 py-1 rounded-md hover:bg-[#6F4E37]/10 text-[#6F4E37]"
            >
              <MessageSquare size={16} />
              <span className="text-xs mt-1">{t('feedback.title')}</span>
            </Link>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
