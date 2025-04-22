
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // When auth state changes, check user role
        if (session?.user) {
          checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
          setIsVendor(false);
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
        checkUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      // Check if admin
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (adminError) {
        console.error('Error checking admin role:', adminError);
        return;
      }
      
      if (adminData?.role === 'admin') {
        setIsAdmin(true);
        setIsVendor(false);
        return;
      }

      // Check if vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (vendorError && vendorError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error checking vendor role:', vendorError);
      }
      
      if (vendorData) {
        setIsVendor(true);
        setIsAdmin(false);
      } else {
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
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error && data.user) {
        toast.success('Signed in successfully');
      }
      
      return { error };
    } catch (err: any) {
      console.error('Error in signIn:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const { error: authError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone
          }
        }
      });
      
      if (!authError && data.user) {
        // Create user profile record
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            name,
            phone,
            role: 'user'
          });
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { error: profileError };
        }
        
        toast.success('Account created successfully');
      }
      
      return { error: authError };
    } catch (err: any) {
      console.error('Error in signUp:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
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
    isVendor
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

// Simple auth guard hook
export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading };
};

// Admin guard hook
export const useRequireAdmin = (redirectTo = '/') => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate(redirectTo);
      }
    }
  }, [user, isAdmin, loading, navigate, redirectTo]);

  return { user, loading, isAdmin };
};

// Vendor guard hook
export const useRequireVendor = (redirectTo = '/') => {
  const { user, loading, isVendor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isVendor) {
        navigate(redirectTo);
      }
    }
  }, [user, isVendor, loading, navigate, redirectTo]);

  return { user, loading, isVendor };
};
