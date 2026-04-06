import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

// Auth pages
import { CustomerAuth } from '@/pages/auth/CustomerAuth';
import { StaffLogin } from '@/pages/auth/StaffLogin';

// Customer pages
import { MenuPage } from '@/pages/customer/MenuPage';
import { OrdersPage } from '@/pages/customer/OrdersPage';
import { ProfilePage } from '@/pages/customer/ProfilePage';
import { OrderConfirmation } from '@/pages/customer/OrderConfirmation';

// Kitchen & Staff
import { KitchenPage } from '@/pages/kitchen/KitchenPage';
import { StaffDashboard } from '@/pages/staff/StaffDashboard';
import { SettingsPage } from '@/pages/staff/SettingsPage';
import { ReportsPage } from '@/pages/staff/ReportsPage';
import { ExpensesPage } from '@/pages/staff/ExpensesPage';
import { TablesPage } from '@/pages/staff/TablesPage';
import { InventoryPage } from '@/pages/staff/InventoryPage';
import { SuppliersPage } from '@/pages/staff/SuppliersPage';
import { PurchasesPage } from '@/pages/staff/PurchasesPage';
import { PromotionsPage } from '@/pages/staff/PromotionsPage';
import { ReturnsPage } from '@/pages/staff/ReturnsPage';
import { GiftCardsPage } from '@/pages/staff/GiftCardsPage';
import { QuotesPage } from '@/pages/staff/QuotesPage';
import { CalendarPage } from '@/pages/staff/CalendarPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<CustomerAuth />} />
            <Route path="/staff/login" element={<StaffLogin />} />

            {/* Customer routes — protected, wrapped in CartProvider */}
            <Route
              path="/"
              element={
                <ProtectedRoute userType="customer">
                  <CartProvider>
                    <MenuPage />
                  </CartProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute userType="customer">
                  <CartProvider>
                    <OrdersPage />
                  </CartProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmed"
              element={
                <ProtectedRoute userType="customer">
                  <CartProvider>
                    <OrderConfirmation />
                  </CartProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute userType="customer">
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Kitchen display — staff only (kitchen + admin + manager) */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['kitchen', 'admin', 'manager']}>
                  <KitchenPage />
                </ProtectedRoute>
              }
            />

            {/* Staff portal — admin + manager + waiter */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager', 'waiter']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Tables — admin + manager + waiter */}
            <Route
              path="/staff/tables"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager', 'waiter']}>
                  <TablesPage />
                </ProtectedRoute>
              }
            />

            {/* Reports — admin + manager */}
            <Route
              path="/staff/reports"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Expenses — admin + manager */}
            <Route
              path="/staff/expenses"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <ExpensesPage />
                </ProtectedRoute>
              }
            />

            {/* Inventory — admin + manager */}
            <Route
              path="/staff/inventory"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />

            {/* Suppliers — admin + manager */}
            <Route
              path="/staff/suppliers"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />

            {/* Purchases — admin + manager */}
            <Route
              path="/staff/purchases"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <PurchasesPage />
                </ProtectedRoute>
              }
            />

            {/* Promotions — admin + manager */}
            <Route
              path="/staff/promotions"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <PromotionsPage />
                </ProtectedRoute>
              }
            />

            {/* Returns — admin + manager */}
            <Route
              path="/staff/returns"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <ReturnsPage />
                </ProtectedRoute>
              }
            />

            {/* Gift Cards — admin + manager */}
            <Route
              path="/staff/gift-cards"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <GiftCardsPage />
                </ProtectedRoute>
              }
            />

            {/* Quotes — admin + manager */}
            <Route
              path="/staff/quotes"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager']}>
                  <QuotesPage />
                </ProtectedRoute>
              }
            />

            {/* Calendar — admin + manager + waiter */}
            <Route
              path="/staff/calendar"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin', 'manager', 'waiter']}>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />

            {/* Settings — admin only */}
            <Route
              path="/staff/settings"
              element={
                <ProtectedRoute userType="staff" allowedRoles={['admin']}>
                  <SettingsPage />
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
