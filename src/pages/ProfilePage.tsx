
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

// Create schema for profile form
const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  phone: z.string().min(5, { message: 'Please enter a valid phone number' }),
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
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
        // Fetch user profile
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Set form values
        profileForm.reset({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, profileForm]);

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
        })
        .eq('id', user.id);

      if (error) throw error;

      // If email changed, update auth email
      if (values.email && values.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });

        if (emailError) throw emailError;
        toast.info('Email update initiated', {
          description: 'Please check your new email for a confirmation link',
        });
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
        throw new Error('Current password is incorrect');
      }

      // Change password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password', {
        description: error.message || 'Please try again',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Update your personal information and password</p>
      </div>

      {/* Profile Information Form */}
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
        <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>
        
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={loading} />
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="john@example.com" 
                      {...field} 
                      disabled={true} // Email is managed by Supabase Auth - can't change it directly
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="cargomate"
              disabled={loading || updating}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Form>
      </div>

      {/* Change Password Form */}
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
        <h2 className="mb-4 text-xl font-semibold">Change Password</h2>
        
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="cargomate"
              disabled={changingPassword}
            >
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ProfilePage;
