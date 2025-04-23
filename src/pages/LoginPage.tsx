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
import { RadioGroup } from "@radix-ui/react-radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string()
    .min(1, { message: 'Please enter your email address' })
    .email({ message: 'Please enter a valid email address' })
    .refine(val => val.includes('.'), { 
      message: 'Email must contain a domain (e.g. example.com)' 
    }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  loginType: z.enum(['user', 'vendor', 'admin']),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      loginType: 'user',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setGeneralError(null);
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);

      if (error) {
        if (error.code === 'email_address_invalid') {
          setGeneralError('Email address format is invalid. Please check your email.');
          toast.error('Invalid email format', {
            description: 'Please use a valid email format with proper domain.',
          });
        } else if (error.code === 'invalid_login_credentials') {
          setGeneralError('Incorrect email or password.');
          toast.error('Login failed', {
            description: 'Incorrect email or password. Please try again.',
          });
        } else {
          setGeneralError(error.message || 'An error occurred while signing in.');
          toast.error('Login failed', {
            description: error.message || 'Please check your credentials and try again',
          });
        }
      } else {
        toast.success('Login successful');

        switch (values.loginType) {
          case 'vendor':
            navigate('/vendor-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setGeneralError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-2">CargoMate</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign in to your account</h2>
        </div>
        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {generalError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
              name="loginType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Login as</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-6 mt-2"
                    >
                      <Label>
                        <input
                          type="radio"
                          value="user"
                          checked={field.value === 'user'}
                          onChange={() => form.setValue('loginType', 'user')}
                          className="mr-2"
                        /> User
                      </Label>
                      <Label>
                        <input
                          type="radio"
                          value="vendor"
                          checked={field.value === 'vendor'}
                          onChange={() => form.setValue('loginType', 'vendor')}
                          className="mr-2"
                        /> Vendor
                      </Label>
                      <Label>
                        <input
                          type="radio"
                          value="admin"
                          checked={field.value === 'admin'}
                          onChange={() => form.setValue('loginType', 'admin')}
                          className="mr-2"
                        /> Admin
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
