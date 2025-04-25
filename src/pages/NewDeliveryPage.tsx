
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
import { sendDeliveryConfirmation } from '@/lib/email';

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
          package_type: values.package_type
        })
        .select();

      if (error) throw error;

      if (data?.[0]) {
        // Calculate the delivery amount based on weight and package type
        const baseRate = 100; // Base rate in INR
        const weightFactor = values.weight_kg * 10; // 10 INR per kg
        
        // Package type multipliers
        const packageMultiplier = {
          'standard': 1,
          'handle_with_care': 1.2,
          'fragile': 1.5,
          'oversized': 2
        };
        
        const amount = Math.round(baseRate + weightFactor) * packageMultiplier[values.package_type];
        
        // Create payment record
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            delivery_id: data[0].id,
            user_id: user.id,
            amount: amount,
            payment_method: 'pending',
            status: 'pending'
          })
          .select();
          
        if (paymentError) throw paymentError;
        
        toast.success('Delivery scheduled successfully!');
        
        // Send confirmation email
        await sendDeliveryConfirmation(user.id, data[0].id, values.package_type);
        
        // Navigate to the invoice/bill page
        if (paymentData?.[0]) {
          navigate(`/deliveries/${data[0].id}?invoice=true`);
        } else {
          navigate('/deliveries');
        }
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
          <FormField
            control={form.control}
            name="package_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="handle_with_care">Handle with Care</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="oversized">Oversized</SelectItem>
                  </SelectContent>
                </Select>
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
