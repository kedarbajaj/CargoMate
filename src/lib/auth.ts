
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
    // Check if admin
    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (adminData?.role === 'admin') {
      setIsAdmin(true);
      setIsVendor(false);
    } else {
      // Check if vendor
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (vendorData) {
        setIsVendor(true);
        setIsAdmin(false);
      } else {
        setIsVendor(false);
        setIsAdmin(false);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { error: authError, data } = await supabase.auth.signUp({
      email,
      password,
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
        
      if (profileError) return { error: profileError };
    }
    
    return { error: authError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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

