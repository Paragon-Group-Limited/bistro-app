import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { StaffRole } from '@/data/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'customer' | 'staff';
  allowedRoles?: StaffRole[];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  userType,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, userType: currentUserType, staff } = useAuth();

  if (requireAuth && !isAuthenticated) {
    if (userType === 'staff') return <Navigate to="/staff/login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    if (currentUserType === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && staff && !allowedRoles.includes(staff.role)) {
    // Kitchen staff can only access kitchen
    if (staff.role === 'kitchen') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/staff" replace />;
  }

  return <>{children}</>;
}
