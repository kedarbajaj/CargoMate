
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendDeliveryConfirmation, notifyVendorNewDelivery, notifyAdminNewDelivery } from '@/lib/email';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Info, MapPin, Package, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  pickup_address: z.string().min(5, { message: 'Pickup address is required' }),
  drop_address: z.string().min(5, { message: 'Delivery address is required' }),
  weight_kg: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0.1, { message: 'Weight must be at least 0.1 kg' })
  ),
  package_type: z.enum(['standard', 'handle_with_care', 'fragile', 'oversized'], {
    errorMap: () => ({ message: 'Please select a package type' })
  }),
});

type FormValues = z.infer<typeof formSchema>;

const NewDeliveryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup_address: userProfile?.current_address || '',
      drop_address: '',
      weight_kg: undefined,
      package_type: 'standard',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error(t('auth.loginRequired'), {
        description: t('delivery.loginDescription')
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the delivery record
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          pickup_address: values.pickup_address,
          drop_address: values.drop_address,
          weight_kg: values.weight_kg,
          user_id: user.id,
          status: 'pending',
          package_type: values.package_type
        })
        .select();

      if (error) throw error;

      if (data?.[0]) {
        // Calculate the delivery amount based on weight and package type
        const baseRate = 100; // Base rate in INR
        const weightFactor = values.weight_kg * 10; // 10 INR per kg
        
        // Package type multipliers
        const packageMultiplier: Record<string, number> = {
          'standard': 1,
          'handle_with_care': 1.2,
          'fragile': 1.5,
          'oversized': 2
        };
        
        const amount = Math.round(baseRate + weightFactor) * packageMultiplier[values.package_type];
        
        // Step 2: Create payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            delivery_id: data[0].id,
            user_id: user.id,
            amount: amount,
            payment_method: 'COD',
            status: 'pending'
          })
          .select();
          
        if (paymentError) throw paymentError;
        
        toast.success(t('delivery.successMessage'));
        
        // Step 3: Send notifications to all parties
        await sendDeliveryConfirmation(user.id, data[0].id, values.package_type);
        
        // Find a vendor to assign (for demo purposes, we'll just get the first vendor)
        const { data: vendors } = await supabase
          .from('vendors')
          .select('id, email')
          .limit(1);
          
        if (vendors && vendors.length > 0) {
          // Assign the vendor to the delivery
          await supabase
            .from('deliveries')
            .update({ vendor_id: vendors[0].id })
            .eq('id', data[0].id);
            
          await notifyVendorNewDelivery(vendors[0].id, data[0].id, values.pickup_address, values.drop_address);
        }
        
        // Notify admin
        await notifyAdminNewDelivery(data[0].id, user.id, vendors?.[0]?.id || '');
        
        // Navigate to the invoice/bill page
        if (paymentData?.[0]) {
          navigate(`/deliveries/${data[0].id}?invoice=true`);
        } else {
          navigate('/deliveries');
        }
      }
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || t('common.tryAgain'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-cargomate-600 dark:text-cargomate-400">{t('delivery.scheduleDelivery')}</h1>
        <p className="text-muted-foreground">{t('delivery.fillDetails')}</p>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">{t('common.importantInfo')}</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          {t('delivery.notificationInfo')}
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pickup_address"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cargomate-500" />
                  {t('delivery.pickupAddress')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('delivery.pickupAddressPlaceholder')} 
                    {...field} 
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="drop_address"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cargomate-500" />
                  {t('delivery.deliveryAddress')}
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('delivery.deliveryAddressPlaceholder')} 
                    {...field} 
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight_kg"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-cargomate-500" />
                  {t('delivery.weight')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="10.5"
                    {...field}
                    value={field.value?.toString() || ''}
                    className="bg-white dark:bg-gray-800"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="package_type"
            render={({ field }) => (
              <FormItem className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-md border border-gray-100 dark:border-gray-700">
                <FormLabel className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-cargomate-500" />
                  {t('delivery.packageType')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-gray-800">
                      <SelectValue placeholder={t('delivery.selectPackageType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">{t('delivery.standard')}</SelectItem>
                    <SelectItem value="handle_with_care">{t('delivery.handleWithCare')}</SelectItem>
                    <SelectItem value="fragile">{t('delivery.fragile')}</SelectItem>
                    <SelectItem value="oversized">{t('delivery.oversized')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cargomate-500 to-cargomate-600 hover:from-cargomate-600 hover:to-cargomate-700 text-white transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('delivery.scheduling')}
              </>
            ) : t('delivery.schedule')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewDeliveryPage;
