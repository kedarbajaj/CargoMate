
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isVendor: boolean;
  userProfile: { name: string; email: string; phone: string; role: string } | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; phone: string; role: string } | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // When auth state changes, check user role
        if (session?.user) {
          setTimeout(() => {
            checkUserRoleAndProfile(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsVendor(false);
          setUserProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check user role on initial load
      if (session?.user) {
        checkUserRoleAndProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRoleAndProfile = async (userId: string) => {
    try {
      console.log('Checking user role for:', userId);
      
      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, phone, role')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error checking user profile:', userError);
        return;
      }
      
      // Set the user profile
      setUserProfile(userData);
      
      // Check if admin
      if (userData?.role === 'admin') {
        console.log('User is an admin');
        setIsAdmin(true);
        setIsVendor(false);
        return;
      }

      // Check if vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (vendorError) {
        console.error('Error checking vendor role:', vendorError);
      }
      
      if (vendorData) {
        console.log('User is a vendor:', vendorData.company_name);
        setIsVendor(true);
        setIsAdmin(false);
      } else {
        console.log('User is a regular user');
        setIsVendor(false);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Unexpected error in checkUserRole:', err);
      setIsAdmin(false);
      setIsVendor(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      
      // Validate email format first
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { 
          error: {
            message: "Email format is invalid",
            code: "email_address_invalid"
          }
        };
      }
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error && data.user) {
        console.log('Sign in successful:', data.user.id);
        toast.success('Signed in successfully');
      } else {
        console.error('Sign in error:', error);
      }
      
      return { error };
    } catch (err: any) {
      console.error('Error in signIn:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      console.log('Signing up user:', email);
      
      // Validate email format first
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return { 
          error: {
            message: "Email format is invalid",
            code: "email_address_invalid"
          }
        };
      }
      
      const { error: authError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (!authError && data.user) {
        console.log('Auth signup successful:', data.user.id);
        
        // Create user profile record
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            phone,
            role: 'user' // Default role, can be updated later
          });
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: profileError };
        }
        
        console.log('User profile created successfully');
        toast.success('Account created successfully');
      } else {
        console.error('Signup error:', authError);
      }
      
      return { error: authError };
    } catch (err: any) {
      console.error('Error in signUp:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      toast.info('Signed out successfully');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Error signing out');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isVendor,
    userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
