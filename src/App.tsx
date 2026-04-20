import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { VerifyEmail } from '@/pages/auth/VerifyEmail';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ResetPassword } from '@/pages/auth/ResetPassword';

import { MenuPage } from '@/pages/customer/MenuPage';
import { OrdersPage } from '@/pages/customer/OrdersPage';
import { ProfilePage } from '@/pages/customer/ProfilePage';
import { OrderConfirmation } from '@/pages/customer/OrderConfirmation';

/**
 * Customer-only React app. Staff & kitchen routes were removed in M8 — those
 * features now live in SMA's PHP admin (M7). The legacy page files are kept on
 * disk in src/pages/{staff,kitchen} for reference but are not in the bundle.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Customer routes — protected, wrapped in CartProvider */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CartProvider><MenuPage /></CartProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <CartProvider><OrdersPage /></CartProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmed"
              element={
                <ProtectedRoute>
                  <CartProvider><OrderConfirmation /></CartProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
