
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

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

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, { message: 'Please enter your email address' })
    .email({ message: 'Please enter a valid email address' }),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
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

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setGeneralError(null);
    setIsLoading(true);
    try {
      console.log('Attempting login with:', values.email);
      const { error } = await signIn(values.email, values.password);

      if (error) {
        console.error('Login error:', error);
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

  const handleForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setForgotPasswordLoading(true);
    try {
      const { error } = await resetPassword(values.email);
      
      if (error) {
        toast.error('Failed to send password reset email', {
          description: error.message
        });
      } else {
        toast.success('Password reset email sent', {
          description: 'Check your inbox for instructions to reset your password'
        });
        setForgotPasswordOpen(false);
      }
    } catch (err: any) {
      toast.error('An error occurred', {
        description: err.message || 'Failed to send password reset email'
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-indigo-600 mb-2">CargoMate</h1>
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
                    <Input placeholder="name@example.com" {...field} className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" />
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
                    <Input type="password" placeholder="••••••••" {...field} className="border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" />
                  </FormControl>
                  <FormMessage />
                  <div className="text-right">
                    <button 
                      type="button" 
                      onClick={() => setForgotPasswordOpen(true)} 
                      className="text-sm text-indigo-600 hover:text-indigo-500 mt-1"
                    >
                      Forgot password?
                    </button>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loginType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Login as</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                        <RadioGroupItem value="user" id="user" className="text-indigo-600" />
                        <Label htmlFor="user" className="cursor-pointer">User</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                        <RadioGroupItem value="vendor" id="vendor" className="text-indigo-600" />
                        <Label htmlFor="vendor" className="cursor-pointer">Vendor</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                        <RadioGroupItem value="admin" id="admin" className="text-indigo-600" />
                        <Label htmlFor="admin" className="cursor-pointer">Admin</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
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
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="name@example.com" 
                        autoComplete="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setForgotPasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
