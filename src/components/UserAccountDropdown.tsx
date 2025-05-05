
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { capitalizeFirstLetter } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types/delivery';

const UserAccountDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut, userProfile } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      // If we already have user profile data from auth context, use it
      if (userProfile) {
        setUserData(userProfile);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, email, role, phone, current_address, pincode')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUserData(data as UserProfile);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user, userProfile]);
  
  if (!user) return null;
  
  const userInitials = userData?.name 
    ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';
  
  const userRole = userData?.role ? capitalizeFirstLetter(userData.role) : 'User';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-cargomate-100 text-cargomate-800">
          {userInitials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{userData?.email || user.email}</p>
            <p className="text-xs text-cargomate-600">{userRole}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">{t('profile.title')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/deliveries" className="cursor-pointer">{t('deliveries.myDeliveries')}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/payments" className="cursor-pointer">{t('payments.history')}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600" 
          onClick={() => signOut()}
        >
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountDropdown;
