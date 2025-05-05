
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Loader2, User, Mail, Phone, MapPin, Hash } from 'lucide-react';
import { UserProfile } from '@/types/delivery';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  current_address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  pincode: z.string().min(4, { message: 'Please enter a valid pincode' }),
});

type FormValues = z.infer<typeof formSchema>;

const ProfileForm: React.FC = () => {
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      current_address: '',
      pincode: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        current_address: userProfile.current_address || '',
        pincode: userProfile.pincode || '',
      });
    } else if (user) {
      form.setValue('email', user.email || '');
      
      const fetchProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('name, email, phone, current_address, pincode')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            form.reset({
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || '',
              current_address: data.current_address || '',
              pincode: data.pincode || '',
            });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      };
      
      fetchProfileData();
    }
  }, [user, userProfile, form]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update user information in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone,
          current_address: values.current_address,
          pincode: values.pincode,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success(t('profile.updateSuccess'));
      
      // Force page refresh to update user data throughout the app
      window.location.reload();
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || t('common.tryAgain'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4 text-cargomate-500" />
                  {t('profile.name')}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.namePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cargomate-500" />
                  {t('profile.email')}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cargomate-500" />
                  {t('profile.phone')}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.phonePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pincode"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-cargomate-500" />
                  {t('profile.pincode')}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.pincodePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="current_address"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cargomate-500" />
                  {t('profile.address')}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('profile.addressPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-cargomate-500 to-cargomate-600 hover:from-cargomate-600 hover:to-cargomate-700 text-white transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.saving')}
            </>
          ) : t('profile.saveChanges')}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
