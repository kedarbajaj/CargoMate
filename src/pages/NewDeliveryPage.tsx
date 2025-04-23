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
  package_type: z.enum(['standard', 'handle_with_care', 'fragile', 'oversized'], {
    errorMap: () => ({ message: 'Please select a package type' })
  }),
});

type FormValues = z.infer<typeof formSchema>;

// No more vendor or date
const NewDeliveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup_address: '',
      drop_address: '',
      weight_kg: undefined,
      package_type: 'standard',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to schedule a delivery');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          pickup_address: values.pickup_address,
          drop_address: values.drop_address,
          weight_kg: values.weight_kg,
          user_id: user.id,
          status: 'pending',
          // Optionally you can store package_type as part of delivery details (as a JSON field or in future migration)
        })
        .select();

      if (error) throw error;

      if (data?.[0]) {
        toast.success('Delivery scheduled successfully!');
        navigate('/deliveries');
      }
    } catch (error: any) {
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
          {/* New Package Type Dropdown */}
          <FormField
            control={form.control}
            name="package_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded p-2"
                  >
                    <option value="standard">Standard</option>
                    <option value="handle_with_care">Handle with Care</option>
                    <option value="fragile">Fragile</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Delivery'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default NewDeliveryPage;
