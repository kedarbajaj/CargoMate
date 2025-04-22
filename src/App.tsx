
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './lib/auth';
import MainLayout from './components/MainLayout';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Main Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DeliveriesPage from './pages/DeliveriesPage';
import NewDeliveryPage from './pages/NewDeliveryPage';
import DeliveryDetailsPage from './pages/DeliveryDetailsPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TrackingPage from './pages/TrackingPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import { supabase } from './integrations/supabase/client';

// App component with the router configuration
const App: React.FC = () => {
  // Log Supabase configuration on init to verify it's properly set up
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) {
          console.error('Supabase connection test failed:', error);
        } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
      }
    };
    
    checkSupabaseConnection();
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes with Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/deliveries" element={
            <ProtectedRoute>
              <MainLayout>
                <DeliveriesPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/deliveries/new" element={
            <ProtectedRoute>
              <MainLayout>
                <NewDeliveryPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/deliveries/:id" element={
            <ProtectedRoute>
              <MainLayout>
                <DeliveryDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/vendor-dashboard" element={
            <ProtectedRoute requireVendor>
              <MainLayout>
                <VendorDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requireAdmin>
              <MainLayout>
                <AdminDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/tracking" element={
            <ProtectedRoute>
              <MainLayout>
                <TrackingPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/payments" element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirect undefined routes to dashboard if logged in, or landing page if not */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </Router>
  );
};

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVendor?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireVendor = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isVendor } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Mark authentication as checked after the first verification
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // Show loading state
  if (loading || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication and role requirements
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !isAdmin) {
    toast.error("You don't have admin access");
    return <Navigate to="/dashboard" replace />;
  }
  
  if (requireVendor && !isVendor) {
    toast.error("You don't have vendor access");
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default App;
