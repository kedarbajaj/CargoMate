
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Building2, Lock, MapPin, Hash } from 'lucide-react';

// Create schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  phone: z.string().min(5, { message: 'Please enter a valid phone number' }),
  role: z.string().optional(),
  companyName: z.string().optional(),
  currentAddress: z.string().optional(),
  pincode: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Create schema for password form
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, userProfile, isVendor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [vendorData, setVendorData] = useState<any>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      companyName: '',
      currentAddress: '',
      pincode: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // If we already have userProfile from auth context, use that
        if (userProfile) {
          profileForm.reset({
            name: userProfile.name || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            role: userProfile.role || '',
            currentAddress: userProfile.current_address || '',
            pincode: userProfile.pincode || '',
          });
          
          // If user is a vendor, fetch vendor data
          if (isVendor) {
            const { data: vendorInfo, error } = await supabase
              .from('vendors')
              .select('company_name')
              .eq('id', user.id)
              .single();
            
            if (!error && vendorInfo) {
              setVendorData(vendorInfo);
              profileForm.setValue('companyName', vendorInfo.company_name || '');
            }
          }
        } else {
          // If not, fetch from database
          const { data, error } = await supabase
            .from('users')
            .select('name, email, phone, role, current_address, pincode')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            toast.error(t('profile.errorFetchingProfile'));
            return;
          }

          // Set form values
          profileForm.reset({
            name: data?.name || '',
            email: data?.email || '',
            phone: data?.phone || '',
            role: data?.role || '',
            currentAddress: data?.current_address || '',
            pincode: data?.pincode || '',
          });
          
          // Check if user is a vendor
          if (data?.role === 'vendor') {
            const { data: vendorInfo, error } = await supabase
              .from('vendors')
              .select('company_name')
              .eq('id', user.id)
              .single();
            
            if (!error && vendorInfo) {
              setVendorData(vendorInfo);
              profileForm.setValue('companyName', vendorInfo.company_name || '');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error(t('common.error'), {
          description: t('profile.errorFetchingProfile')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, userProfile, isVendor, profileForm, t]);

  const onUpdateProfile = async (values: ProfileFormValues) => {
    if (!user) return;

    setUpdating(true);
    try {
      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: values.name,
          phone: values.phone,
          current_address: values.currentAddress,
          pincode: values.pincode,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // If vendor, update company name
      if (isVendor && values.companyName) {
        const { error: vendorError } = await supabase
          .from('vendors')
          .update({
            company_name: values.companyName,
          })
          .eq('id', user.id);
          
        if (vendorError) throw vendorError;
      }

      // If email changed, update auth email
      if (values.email && values.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (emailError) throw emailError;
        toast.info(t('profile.emailUpdateInitiated'), {
          description: t('profile.checkNewEmail'),
        });
      }

      toast.success(t('profile.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(t('common.error'), {
        description: t('profile.updateFailed')
      });
    } finally {
      setUpdating(false);
    }
  };

  const onChangePassword = async (values: PasswordFormValues) => {
    setChangingPassword(true);
    try {
      // First, verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profileForm.getValues('email') || '',
        password: values.currentPassword,
      });

      if (signInError) {
        throw new Error(t('profile.incorrectCurrentPassword'));
      }

      // Change password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      toast.success(t('profile.passwordChanged'));
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(t('common.error'), {
        description: error.message || t('common.tryAgain'),
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-cargomate-600 dark:text-cargomate-400">{t('profile.settings')}</h1>
        <p className="text-muted-foreground">{t('profile.updateInfo')}</p>
      </div>

      {/* Profile Information Form */}
      <div className="rounded-lg border bg-white dark:bg-gray-800 p-6 text-card-foreground shadow-lg transition-all hover:shadow-xl">
        <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
          <User size={20} className="text-cargomate-500" />
          {t('profile.personalInfo')}
        </h2>
        
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cargomate-500" />
                    {t('profile.fullName')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
                      {...field} 
                      disabled={loading}
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-cargomate-500" />
                    {t('profile.emailAddress')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john@example.com" 
                      {...field} 
                      disabled={true} // Email is managed by Supabase Auth - can't change it directly
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-cargomate-500" />
                    {t('profile.phoneNumber')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      {...field} 
                      disabled={loading} 
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="currentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cargomate-500" />
                    {t('profile.currentAddress')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="123 Main St, City, State" 
                      {...field} 
                      disabled={loading} 
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="pincode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-cargomate-500" />
                    {t('profile.pincode')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="110001" 
                      {...field} 
                      disabled={loading} 
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-cargomate-500" />
                    {t('profile.accountType')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      disabled={true} 
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isVendor && (
              <FormField
                control={profileForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-cargomate-500" />
                      {t('profile.companyName')}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Acme Shipping Co." 
                        {...field} 
                        disabled={loading} 
                        className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cargomate-500 to-cargomate-600 hover:from-cargomate-600 hover:to-cargomate-700 text-white transition-all"
              disabled={loading || updating}
            >
              {updating ? t('profile.updating') : t('profile.updateProfile')}
            </Button>
          </form>
        </Form>
      </div>

      {/* Change Password Form */}
      <div className="rounded-lg border bg-white dark:bg-gray-800 p-6 text-card-foreground shadow-lg transition-all hover:shadow-xl">
        <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
          <Lock size={20} className="text-cargomate-500" />
          {t('profile.changePassword')}
        </h2>
        
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-cargomate-500" />
                    {t('profile.currentPassword')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field}
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-cargomate-500" />
                    {t('profile.newPassword')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field} 
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-cargomate-500" />
                    {t('profile.confirmPassword')}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field} 
                      className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cargomate-500 to-cargomate-600 hover:from-cargomate-600 hover:to-cargomate-700 text-white transition-all"
              disabled={changingPassword}
            >
              {changingPassword ? t('profile.changingPassword') : t('profile.changePassword')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
