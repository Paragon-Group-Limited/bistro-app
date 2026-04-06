import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { Customer, StaffMember, StaffRole } from '@/data/types';
import { customers as mockCustomers, staffMembers as mockStaff } from '@/data/mock';
import {
  isFirebaseConfigured,
  setupRecaptcha,
  sendOtp as firebaseSendOtp,
  verifyOtp as firebaseVerifyOtp,
  firebaseSignOut,
} from '@/lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';
import type { RecaptchaVerifier } from 'firebase/auth';

type UserType = 'customer' | 'staff';

interface AuthState {
  isAuthenticated: boolean;
  userType: UserType | null;
  customer: Customer | null;
  staff: StaffMember | null;
}

interface AuthContextType extends AuthState {
  // Customer auth
  sendOtp: (phone: string) => Promise<boolean>;
  verifyAndLogin: (otp: string) => Promise<boolean>;
  registerCustomer: (name: string, phone: string) => Promise<boolean>;
  // Staff auth
  loginStaff: (phone: string, password: string) => Promise<{ success: boolean; role?: StaffRole }>;
  // General
  logout: () => void;
  isFirebaseMode: boolean;
  pendingPhone: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'bistro-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { isAuthenticated: false, userType: null, customer: null, staff: null };
  });

  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const isFirebaseMode = isFirebaseConfigured();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ---- Send OTP ----
  const sendOtp = async (phone: string): Promise<boolean> => {
    const formattedPhone = phone.startsWith('+') ? phone : `+88${phone}`;
    setPendingPhone(formattedPhone);

    if (isFirebaseMode) {
      try {
        // Set up recaptcha if not already done
        if (!recaptchaRef.current) {
          recaptchaRef.current = setupRecaptcha('recaptcha-container');
        }
        if (!recaptchaRef.current) return false;

        const confirmation = await firebaseSendOtp(formattedPhone, recaptchaRef.current);
        confirmationRef.current = confirmation;
        return true;
      } catch (err) {
        console.error('Firebase OTP error:', err);
        // Reset recaptcha on error so it can be retried
        recaptchaRef.current = null;
        return false;
      }
    } else {
      // Mock mode — pretend OTP sent
      await new Promise(r => setTimeout(r, 500));
      return true;
    }
  };

  // ---- Verify OTP & Login ----
  const verifyAndLogin = async (otp: string): Promise<boolean> => {
    if (!pendingPhone) return false;

    if (isFirebaseMode) {
      try {
        if (!confirmationRef.current) return false;
        const firebaseUser = await firebaseVerifyOtp(confirmationRef.current, otp);
        
        // Look up or create customer
        let customer = mockCustomers.find(c => c.phone === pendingPhone);
        if (!customer) {
          // Phone verified but no account — return false to prompt registration
          return false;
        }

        setState({
          isAuthenticated: true,
          userType: 'customer',
          customer,
          staff: null,
        });
        confirmationRef.current = null;
        return true;
      } catch (err) {
        console.error('OTP verification failed:', err);
        return false;
      }
    } else {
      // Mock mode — any 4-digit code works
      await new Promise(r => setTimeout(r, 500));
      if (otp.length !== 4) return false;

      let customer = mockCustomers.find(c => c.phone === pendingPhone);
      if (!customer) return false;

      setState({
        isAuthenticated: true,
        userType: 'customer',
        customer,
        staff: null,
      });
      return true;
    }
  };

  // ---- Register Customer ----
  const registerCustomer = async (name: string, phone: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    const formattedPhone = phone.startsWith('+') ? phone : `+88${phone}`;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone: formattedPhone,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
    };

    setState({
      isAuthenticated: true,
      userType: 'customer',
      customer: newCustomer,
      staff: null,
    });
    return true;
  };

  // ---- Staff Login ----
  const loginStaff = async (phone: string, password: string): Promise<{ success: boolean; role?: StaffRole }> => {
    await new Promise(r => setTimeout(r, 500));
    if (password !== 'bistro123') return { success: false };

    const formattedPhone = phone.startsWith('+') ? phone : `+88${phone}`;
    const staff = mockStaff.find(s => s.phone === formattedPhone && s.isActive);
    if (!staff) return { success: false };

    setState({
      isAuthenticated: true,
      userType: 'staff',
      customer: null,
      staff,
    });
    return { success: true, role: staff.role };
  };

  // ---- Logout ----
  const logout = () => {
    setState({ isAuthenticated: false, userType: null, customer: null, staff: null });
    localStorage.removeItem(STORAGE_KEY);
    if (isFirebaseMode) firebaseSignOut();
    confirmationRef.current = null;
    setPendingPhone(null);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        sendOtp,
        verifyAndLogin,
        registerCustomer,
        loginStaff,
        logout,
        isFirebaseMode,
        pendingPhone,
      }}
    >
      {children}
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
