import React, { useEffect, useState } from 'react';
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

const formSchema = z.object({
  pickup_address: z.string().min(5, { message: 'Pickup address is required' }),
  drop_address: z.string().min(5, { message: 'Delivery address is required' }),
  weight_kg: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0.1, { message: 'Weight must be at least 0.1 kg' })
  ),
  scheduled_date: z.string().min(1, { message: 'Scheduled date is required' }),
});

type FormValues = z.infer<typeof formSchema>;

interface Vendor {
  id: string;
  company_name: string;
  email: string;
}

const NewDeliveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup_address: '',
      drop_address: '',
      weight_kg: undefined,
      scheduled_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('id, company_name, email');
        
        if (error) throw error;
        
        setVendors(data || []);
        if (data && data.length > 0) {
          setSelectedVendor(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendors');
      }
    };

    fetchVendors();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to schedule a delivery');
      return;
    }

    if (!selectedVendor) {
      toast.error('Please select a vendor');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledDate = new Date(values.scheduled_date);
      
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          pickup_address: values.pickup_address,
          drop_address: values.drop_address,
          weight_kg: values.weight_kg,
          scheduled_date: scheduledDate.toISOString(),
          user_id: user.id,
          vendor_id: selectedVendor,
          status: 'pending',
        })
        .select();

      if (error) throw error;

      const userNotification = {
        user_id: user.id,
        message: `Your delivery from ${values.pickup_address} to ${values.drop_address} has been scheduled.`,
        status: 'unread' as 'unread' | 'read',
      };

      await supabase.from('notifications').insert(userNotification);
      
      const vendorNotification = {
        user_id: selectedVendor,
        message: `New delivery request: Pickup from ${values.pickup_address} to ${values.drop_address}.`,
        status: 'unread' as 'unread' | 'read',
      };

      await supabase.from('notifications').insert(vendorNotification);

      await supabase.functions.invoke('send-delivery-emails', {
        body: {
          delivery: data?.[0],
          vendor_id: selectedVendor,
          user_id: user.id
        }
      });

      toast.success('Delivery scheduled successfully!');
      navigate('/deliveries');
    } catch (error: any) {
      console.error('Error scheduling delivery:', error);
      toast.error('Failed to schedule delivery', {
        description: error.message || 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule a New Delivery</h1>
        <p className="text-muted-foreground">Fill in the details below to schedule your delivery</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pickup_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pickup Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, State, ZIP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="drop_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Address</FormLabel>
                <FormControl>
                  <Input placeholder="456 Oak St, City, State, ZIP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="10.5"
                    {...field}
                    value={field.value?.toString() || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Select Vendor</FormLabel>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      selectedVendor === vendor.id
                        ? 'border-cargomate-500 bg-cargomate-50'
                        : 'hover:border-cargomate-300'
                    }`}
                    onClick={() => setSelectedVendor(vendor.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vendor.company_name}</p>
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          selectedVendor === vendor.id
                            ? 'border-cargomate-500 bg-cargomate-500'
                            : 'border-gray-300'
                        }`}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 rounded-md border border-dashed p-4 text-center">
                  <p className="text-muted-foreground">Loading vendors...</p>
                </div>
              )}
            </div>
            {vendors.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                No vendors available. Please contact support.
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            variant="cargomate"
            disabled={isSubmitting || vendors.length === 0}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Delivery'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewDeliveryPage;
