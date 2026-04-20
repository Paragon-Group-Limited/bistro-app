import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type AuthCustomer } from '@/lib/api';
import { tokenStore, ApiError } from '@/lib/apiClient';

// ============================================
// Email/password customer auth.
// JWT is stored in localStorage by apiClient/tokenStore.
// The exposed `customer` object preserves the original UI's shape (name,
// totalOrders, totalSpent, createdAt) so the existing pages keep working.
// ============================================

/** Customer object exposed to the UI. Superset of the original Customer type
 *  + the new auth fields, so old and new components both work. */
export interface UICustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  full_name: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

function adaptCustomer(c: AuthCustomer | null): UICustomer | null {
  if (!c) return null;
  return {
    id: String(c.id),
    name: c.full_name,
    phone: c.phone,
    email: c.email,
    full_name: c.full_name,
    createdAt: new Date().toISOString(),
    totalOrders: 0,
    totalSpent: 0,
  };
}

interface AuthState {
  isAuthenticated: boolean;
  customer: UICustomer | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signup: (input: { email: string; password: string; full_name: string; phone: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, new_password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CUSTOMER_KEY = 'bistro-customer';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    if (!tokenStore.isAuthenticated()) {
      return { isAuthenticated: false, customer: null, loading: false };
    }
    const cached = localStorage.getItem(CUSTOMER_KEY);
    if (cached) {
      try {
        return { isAuthenticated: true, customer: adaptCustomer(JSON.parse(cached)), loading: false };
      } catch { /* fall through */ }
    }
    return { isAuthenticated: true, customer: null, loading: true };
  });

  // Persist the underlying API shape so reload restores cleanly
  useEffect(() => {
    if (state.customer) {
      const apiShape: AuthCustomer = {
        id: Number(state.customer.id),
        email: state.customer.email,
        full_name: state.customer.full_name,
        phone: state.customer.phone,
      };
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(apiShape));
    } else {
      localStorage.removeItem(CUSTOMER_KEY);
    }
  }, [state.customer]);

  const signup: AuthContextType['signup'] = async (input) => {
    await authApi.signup(input);
    // Server replies 202 + verification email; user must verify before login
  };

  const login: AuthContextType['login'] = async (email, password) => {
    setState(s => ({ ...s, loading: true }));
    try {
      const res = await authApi.login(email, password);
      setState({ isAuthenticated: true, customer: adaptCustomer(res.customer), loading: false });
    } catch (err) {
      setState(s => ({ ...s, loading: false }));
      throw err;
    }
  };

  const logout: AuthContextType['logout'] = async () => {
    await authApi.logout();
    setState({ isAuthenticated: false, customer: null, loading: false });
  };

  const forgotPassword: AuthContextType['forgotPassword'] = async (email) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword: AuthContextType['resetPassword'] = async (token, new_password) => {
    await authApi.resetPassword(token, new_password);
  };

  const resendVerification: AuthContextType['resendVerification'] = async (email) => {
    await authApi.resendVerification(email);
  };

  const verifyEmail: AuthContextType['verifyEmail'] = async (token) => {
    await authApi.verify(token);
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signup, login, logout, forgotPassword, resetPassword, resendVerification, verifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Re-export ApiError for callers that catch errors from auth methods
export { ApiError };
