import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(5, { message: 'Please enter a valid phone number' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  role: z.enum(['user', 'vendor', 'admin'], { message: 'Please select a role' }),
  companyName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    if (data.role === 'vendor') {
      return !!data.companyName && data.companyName.length >= 2;
    }
    return true;
  },
  {
    message: "Company name is required for vendors",
    path: ["companyName"],
  }
);

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      companyName: '',
    },
  });
  
  const selectedRole = form.watch('role');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log('Attempting to register with:', values.email);
      const { error } = await signUp(
        values.email, 
        values.password, 
        values.name, 
        values.phone
      );
      
      if (error) {
        console.error('Registration error:', error);
        toast.error('Registration failed', {
          description: error.message || 'Please try again with different credentials',
        });
        setIsLoading(false);
        return;
      }
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const userId = userData.user.id;

        await supabase
          .from('users')
          .update({ role: values.role, name: values.name, phone: values.phone, email: values.email })
          .eq('id', userId);

        if (values.role === 'vendor' && values.companyName) {
          await supabase
            .from('vendors')
            .insert({
              id: userId,
              company_name: values.companyName,
              email: values.email,
              phone: values.phone
            });
        }

        toast.success('Welcome to CargoMate! Registration successful.', {
          description: 'You can now log in to your account.',
        });

        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    } catch (err: any) {
      console.error('Unexpected error during registration:', err);
      toast.error('An unexpected error occurred', {
        description: err.message || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">CargoMate</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Create an account</h2>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'user' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => form.setValue('role', 'user')}
                    >
                      User
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'vendor' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => form.setValue('role', 'vendor')}
                    >
                      Vendor
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'admin' ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => form.setValue('role', 'admin')}
                    >
                      Admin
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedRole === 'vendor' && (
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Shipping Co." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
